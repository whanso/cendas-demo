import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TaskListSkeleton() {
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-full bg-muted rounded animate-pulse mb-4" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[150px]">Progress</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="h-[52px]">
              <TableCell>
                <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell className="text-right">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
