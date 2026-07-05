"use client";

import * as React from "react";
import { resetUserCycle, overrideUserTier, triggerUserMultiplier } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UsersTable({ initialUsers }: { initialUsers: any[] }) {

    async function handleReset(id: string) {
        if(confirm("Reset weekly cycle?")) {
            await resetUserCycle(id);
            toast.success("User cycle reset.");
        }
    }

    async function handleOverrideTier(id: string, tier: string) {
        await overrideUserTier(id, tier as any);
        toast.success(`Tier updated to ${tier}`);
    }

    async function handleMultiplier(id: string, multiplier: number) {
        await triggerUserMultiplier(id, multiplier);
        toast.success(`Multiplier set to ${multiplier}x`);
    }

    return (
        <div className="rounded-xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 text-muted-foreground">
                        <tr>
                            <th className="pb-3 font-medium">Email</th>
                            <th className="pb-3 font-medium">Tier</th>
                            <th className="pb-3 font-medium">Tokens This Cycle</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Multiplier</th>
                            <th className="pb-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {initialUsers.map(user => (
                            <tr key={user.id}>
                                <td className="py-3">{user.email || "Guest"}</td>
                                <td className="py-3">
                                    <Select defaultValue={user.tier} onValueChange={(val) => handleOverrideTier(user.id, val)}>
                                        <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FREE">FREE</SelectItem>
                                            <SelectItem value="PRO">PRO</SelectItem>
                                            <SelectItem value="ULTRA">ULTRA</SelectItem>
                                            <SelectItem value="MAX">MAX</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="py-3">{user.tokens_consumed_this_cycle.toLocaleString()}</td>
                                <td className="py-3">
                                    {user.is_throttled ? (
                                        <span className="rounded-full bg-red-900/50 px-2 py-0.5 text-xs text-red-400">Throttled</span>
                                    ) : (
                                        <span className="rounded-full bg-green-900/50 px-2 py-0.5 text-xs text-green-400">Active</span>
                                    )}
                                </td>
                                <td className="py-3">
                                    <Select defaultValue={user.capacityMultiplier.toString()} onValueChange={(val) => handleMultiplier(user.id, parseInt(val))}>
                                        <SelectTrigger className="h-8 w-20 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1x</SelectItem>
                                            <SelectItem value="2">2x</SelectItem>
                                            <SelectItem value="4">4x</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="py-3 text-right">
                                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleReset(user.id)}>Reset Cycle</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {initialUsers.length === 0 && <p className="mt-4 text-center text-sm text-muted-foreground">No users found.</p>}
            </div>
        </div>
    )
}
