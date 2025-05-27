"use client";

import { Role } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddEditCourseForm } from "@/components/AddEditCourseForm";
import { dayLabels } from "@/lib/constants";

export type CourseCardProps = {
  color: string;
  days: string[];
  title: string;
  timeStart: string;
  timeEnd: string;
  code: string;
  role: Role;
  id: number;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function CourseCard({
  color,
  days,
  title,
  timeStart,
  timeEnd,
  code,
  role,
  id,
  onEdit,
  onDelete,
}: CourseCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const shortDays = days
    .map((fullDay) => {
      const entry = Object.entries(dayLabels).find(([, label]) => label === fullDay);
      return entry ? entry[0] : undefined;
    })
    .filter(Boolean) as ("M" | "T" | "W" | "Th" | "F")[];

  const handleCardClick = () => {
    if (!isEditOpen) {
      router.push(
        role === "LECTURER"
          ? `/dashboard/course/${id}/questionnaire`
          : `/dashboard/course/${id}/live-poll`
      );
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
    onEdit?.();
  };

  const CardContent = () => (
    <>
      <div
        className="min-h-[40%] w-full rounded-t-md"
        style={{ backgroundColor: color }}
      />
      <div className="h-[60%] pt-3 px-6 flex flex-col gap-2 items-start justify-start">
        <p className="text-xs text-[#434343]">
          Time: {timeStart} - {timeEnd}
        </p>
        <p className="text-lg text-left leading-tight">{title}</p>
        <span className="inline-flex gap-4">
          <p className="text-sm">
            Code:{" "}
            <em>
              {(+code).toLocaleString("en-US", {
                minimumIntegerDigits: 6,
                useGrouping: false,
              })}
            </em>
          </p>
          <p className="text-sm capitalize">
            Role: <em>{role.toLocaleLowerCase()}</em>
          </p>
        </span>
        <p className="text-xs text-left text-[#434343]">{days.join(", ")}</p>
      </div>
    </>
  );

  const MobileCardContent = () => (
    <>
      <div style={{ backgroundColor: color }} className="mt-4 h-4 w-full" />
      <div className="min-h-[60%] py-3 px-6 flex flex-col gap-2 items-start justify-start">
        <p className="text-xs text-[#18328D]">
          Time: {timeStart} - {timeEnd}
        </p>
        <p className="text-xl text-left leading-tight">{title}</p>
      </div>
      <p className="px-6 text-xs text-[#585858]">{days.join(", ")}</p>
    </>
  );

  const MenuDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-gray-200 focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50">
        {role === "LECTURER" && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              handleEdit(event as unknown as React.MouseEvent);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={(event) => handleDelete(event as unknown as React.MouseEvent)}>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>{role === "LECTURER" ? "Delete" : "Leave"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden relative w-80 h-40 border border-black rounded-xl shadow-lg">
        <MenuDropdown />
        <button
          onClick={handleCardClick}
          className="w-full h-full text-left"
          disabled={isEditOpen}
        >
          <MobileCardContent />
        </button>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex relative w-80 h-56 rounded-md shadow-lg">
        <MenuDropdown />
        <button
          onClick={handleCardClick}
          className="w-full h-full text-left"
          disabled={isEditOpen}
        >
          <CardContent />
        </button>
      </div>

      <AddEditCourseForm
        mode="edit"
        courseId={id}
        isOpen={isEditOpen}
        onOpenChange={(open: boolean) => !open && handleEditClose()}
        defaultValues={{
          title,
          color,
          days: shortDays,
          startTime: timeStart,
          endTime: timeEnd,
        }}
        onSuccess={handleEditClose}
      />
    </>
  );
}