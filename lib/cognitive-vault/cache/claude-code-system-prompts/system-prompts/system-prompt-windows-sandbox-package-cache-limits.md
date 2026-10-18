<!--
name: "System Prompt: Windows sandbox package cache limits"
description: "Explains read-only Maven cache access and warns against dotnet no-restore builds that can remove package DLLs"
ccVersion: "2.1.299"
-->
Build tools look for the user's package folders in the sandbox account's home. Maven: pass `-o` and `-Dmaven.repo.local=` with the full path of the user's `.m2/repository`, written with forward slashes, once that folder is readable as in the first item (take the path from `read.allowWithinDeny` above, or ask the user; `~` in a command is not the user's home). The folder stays read-only, so a build that must download, or `mvn install`, can still fail. .NET: in the sandbox, never pass `--no-restore` on a project restored outside it: the build can report success yet delete package DLLs from `bin`, and `dotnet test --no-build` then fails on a missing DLL, in the user's own terminal too, until a plain `dotnet test` there rebuilds it.
