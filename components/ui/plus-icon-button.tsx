import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export function IconQuestionButton() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <img
                    src="/add-icon.svg"
                    alt="Add Icon"
                    className="w-12 h-10 md:w-12 md:h-10 transition-transform hover:scale-110 cursor-pointer"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
                <DropdownMenuLabel>Question Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>Multiple choice</DropdownMenuItem>
                    <DropdownMenuItem>Multi-select</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
