import { POST } from '../app/api/orchestrator/route';
import { prisma } from '../lib/db';
import { weavePrompt } from '../lib/cognitive-vault/prompt-weaver';

// Define mocks
jest.mock('../lib/db', () => ({
    prisma: {
        systemConfig: {
            findUnique: jest.fn(),
        },
        user: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
        userSubscription: {
            findUnique: jest.fn(),
        },
        memoryNode: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
        generation: {
            findMany: jest.fn(),
        }
    }
}));

// Provide access to global fetch
global.fetch = jest.fn();

// Mock google-generative-ai
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockResolvedValue({
                response: {
                    text: () => JSON.stringify({ classification: "SYSTEM_DIRECTIVE" })
                }
            })
        })
    }))
}));

// We need to spy on weavePrompt for Pillar 3
jest.mock('../lib/cognitive-vault/prompt-weaver', () => ({
    weavePrompt: jest.fn().mockResolvedValue({
        wovenPrompt: "Mocked woven prompt that contains CRITICAL CONSTRAINT. Length is less than 7500.",
        sourceUsed: "mock-source"
    })
}));

describe('Commercial E2E Integration QA Simulator', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset implementations so mockResolvedValue doesn't bleed between tests
        jest.restoreAllMocks();
    });

    test('Pillar 1: Payload Multiplexer & Routing Check (GLOBAL_OPENROUTER)', async () => {
        // Setup mock config
        (prisma.systemConfig.findUnique as jest.Mock).mockResolvedValue({
            id: 'CURRENT_GLOBAL_CONFIG',
            api_routing_mode: 'GLOBAL', // Changed to GLOBAL to match code
            global_aggregator_key: 'encrypted:mock-openrouter-key',
            ai_target_model_id: 'mock-model'
        });
        (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'user123' });
        (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
            tier: 'PRO',
            userId: 'user123'
        });
        (prisma.memoryNode.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.generation.findMany as jest.Mock).mockResolvedValue([]);

        // Mock openrouter response
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: '{"message": "<response>test response</response>"}' } }]
            })
        });

        const req = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'test routing' })
        });

        const response = await POST(req);
        expect(response.status).toBe(200);

        expect(global.fetch).toHaveBeenCalledWith(
            "https://openrouter.ai/api/v1/chat/completions",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    "Authorization": expect.stringContaining("Bearer"),
                    "Content-Type": "application/json"
                }),
                body: expect.any(String) // We can check this more strictly if we want
            })
        );
    });

    test('Pillar 2: File Upload & Management Pipeline', async () => {
        // Mock a restricted tier for this test specifically to avoid state bleed
        (prisma.systemConfig.findUnique as jest.Mock).mockResolvedValue({
            id: 'CURRENT_GLOBAL_CONFIG',
            api_routing_mode: 'GLOBAL',
            global_aggregator_key: 'encrypted:mock-openrouter-key',
            ai_target_model_id: 'mock-model'
        });
        (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'user_restricted' });
        (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
            tier: 'FREE',
            userId: 'user_restricted'
        });

        // User uploads 3+ files but is on restricted tier
        const req = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'analyze files', files: ['f1.txt', 'f2.txt', 'f3.txt'] })
        });

        const response = await POST(req);
        expect(response.status).toBe(403);
        let rawText = "";
        const reader = response.body!.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            rawText += new TextDecoder().decode(value);
        }
        const data = JSON.parse(rawText);
        expect(data.code).toBe('QUOTA_EXCEEDED');
    });

    test('Pillar 3: The Cognitive Vault & PromptWeaver Execution', async () => {
        // Setup mock config with FREE tier so weavePrompt is triggered in Orchestrator
        (prisma.systemConfig.findUnique as jest.Mock).mockResolvedValue({
            id: 'CURRENT_GLOBAL_CONFIG',
            api_routing_mode: 'GLOBAL',
            global_aggregator_key: 'encrypted:mock-openrouter-key',
            ai_target_model_id: 'mock-model'
        });
        (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'user123' });
        (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
            activeTier: 'FREE',
            userId: 'user123'
        });
        (prisma.memoryNode.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.generation.findMany as jest.Mock).mockResolvedValue([]);

        // Mock openrouter response
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: '{"message": "<response>test</response>"}' } }]
            })
        });

        // We use the real prompt-weaver for this test to actually assert its length and contents
        const { weavePrompt: realWeavePrompt } = jest.requireActual('../lib/cognitive-vault/prompt-weaver');
        (weavePrompt as jest.Mock).mockImplementation(realWeavePrompt);

        const req = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'why is the sky blue?' })
        });

        const response = await POST(req);
        expect(response.status).toBe(200);

        // weavePrompt should have been called
        expect(weavePrompt).toHaveBeenCalledWith('why is the sky blue?', expect.any(String), expect.any(String), expect.any(String));

        // Execute prompt weaver directly to assert constraints
        const result = await realWeavePrompt("why is the sky blue?", "", "", "FREE");
        expect(result.wovenPrompt).toContain('CRITICAL CONSTRAINT');
        expect(result.wovenPrompt.length).toBeLessThanOrEqual(7500);
        console.log(`Pillar 3: Woven prompt length: ${result.wovenPrompt.length}`);
    });

    test('Pillar 4: XML Parsing & Graph Memory Generation', async () => {
        // Setup config
        (prisma.systemConfig.findUnique as jest.Mock).mockResolvedValue({
            id: 'CURRENT_GLOBAL_CONFIG',
            api_routing_mode: 'GLOBAL',
            global_aggregator_key: 'encrypted:mock-openrouter-key',
            ai_target_model_id: 'mock-model'
        });
        (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'user123' });
        (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue({
            tier: 'PRO',
            userId: 'user123'
        });

        // OpenRouter returns text, not inner JSON. The orchestrator's response_format is { type: "json_object" }.
        // The mock AI responds with valid JSON string.
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: '{"message": "Wait let me think. <thoughts>Planning...</thoughts><response>Final Answer</response>"}' } }]
            }),
            body: new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(JSON.stringify({message: "Final Answer"}))); controller.close(); } })
        });

        const req = new Request('http://localhost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'test xml parsing' })
        });

        const response = await POST(req);
        const data = await response.json();

        // Orchestrator parses the response and isolates Final Answer
        expect(data.message).toBe("Final Answer");

        // Verify Graph Memory Generation (MemoryNode create was called)
        expect(prisma.memoryNode.create).toHaveBeenCalledWith(
        expect.objectContaining({
            data: expect.objectContaining({
                userId: 'user123',
                domainCategory: 'ARCHITECTURE',
                network: 'OBSERVATION',
                content: expect.stringContaining('Vibe-Engineering Synthesis')
            })
        })
    );
    });

});
