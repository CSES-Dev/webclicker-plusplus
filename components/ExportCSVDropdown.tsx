import { JSX } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportCSVType } from "@/types/ExportCSVType";

interface ExportCSVDropdownProps {
    onSelect: (selectedType: ExportCSVType) => void;
    label?: JSX.Element | string;
}

export function ExportCSVDropdown({ onSelect, label }: ExportCSVDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {label ?? (
                    <button className="h-10 w-40 px-3 bg-primary text-white rounded-lg focus:outline-none">
                        Export CSV
                    </button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
                <DropdownMenuLabel>CSV Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onSelect={() => {
                            onSelect(ExportCSVType.BASIC);
                        }}
                    >
                        Basic CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => {
                            onSelect(ExportCSVType.ADVANCED);
                        }}
                    >
                        Advanced CSV
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
