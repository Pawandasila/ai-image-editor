import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function ProjectCard({ project, onEdit }) {
  const { mutate: deleteProject, isLoading } = useConvexMutation(
    api.projects.deleteProject
  );

  const lastUpdated = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
  });

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteProject({ projectId: project._id });
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project. Please try again.");
      }
    }
  };

  return (
    <Card className="group relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 overflow-hidden hover:border-white/30 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 backdrop-blur-sm border-slate-600/30">
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-600 relative overflow-hidden">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center">
              <Edit className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
          <Button 
            variant="glass" 
            size="sm" 
            onClick={onEdit} 
            className="gap-2 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white shadow-lg"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={handleDelete}
            className="gap-2 bg-red-500/20 backdrop-blur-md border-red-400/30 hover:bg-red-500/30 text-red-300 hover:text-red-200 shadow-lg"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project Info */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-white mb-2 truncate text-lg">
          {project.title}
        </h3>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Updated {lastUpdated}</span>
          <Badge
            variant="secondary"
            className="text-xs bg-gradient-to-r from-slate-600/80 to-slate-500/80 text-slate-200 border border-slate-500/30"
          >
            {project.width} × {project.height}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
