import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuestionType } from "@prisma/client";

interface IconQuestionButtonProps {
    onSelect: (selectedType: QuestionType) => void;
    label?: JSX.Element | string;
}

export function IconQuestionButton({ onSelect, label }: IconQuestionButtonProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {label ?? (
                    <img
                        src="/add-icon.svg"
                        alt="Add Icon"
                        className="w-12 h-10 md:w-12 md:h-10 transition-transform hover:scale-110 cursor-pointer"
                    />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
                <DropdownMenuLabel>Question Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => onSelect(QuestionType.MCQ)}>
                        Multiple choice
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onSelect(QuestionType.MSQ)}>
                        Multi-select
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
