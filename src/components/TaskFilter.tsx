import { Button } from "@/components/ui/button";
import { CHECKLIST_STATUS, type ChecklistStatusKeys } from "@/types/schemas";
import { StatusIcon } from "@/components/StatusIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface TaskFilterProps {
  statusFilter: ChecklistStatusKeys | "ALL";
  onStatusFilterChange: (status: ChecklistStatusKeys | "ALL") => void;
}

export function TaskFilter({
  statusFilter,
  onStatusFilterChange,
}: TaskFilterProps) {
  const allStatuses = {
    ALL: "All Tasks",
    ...CHECKLIST_STATUS,
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium text-muted-foreground mr-2 shrink-0">
        Filter by:
      </span>

      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {allStatuses[statusFilter]}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px]">
            {Object.entries(allStatuses).map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() =>
                  onStatusFilterChange(key as ChecklistStatusKeys | "ALL")
                }
              >
                {key !== "ALL" ? (
                  <StatusIcon
                    status={key as ChecklistStatusKeys}
                    className="mr-2 h-4 w-4"
                  />
                ) : (
                  <div className="w-4 mr-2" />
                )}
                {value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        {Object.entries(allStatuses).map(([key, value]) => (
          <Button
            key={key}
            variant={statusFilter === key ? "secondary" : "ghost"}
            size="sm"
            onClick={() =>
              onStatusFilterChange(key as ChecklistStatusKeys | "ALL")
            }
            className="rounded-full"
          >
            {value}
          </Button>
        ))}
      </div>
    </div>
  );
}
