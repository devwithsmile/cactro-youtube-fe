import { useQuery } from '@tanstack/react-query';
import { fetchVideoDetails, fetchVideoComments, fetchNotes } from '@/lib/api';
import { VideoCard } from '@/components/VideoCard';
import { CommentSection } from '@/components/CommentSection';
import { NotesSection } from '@/components/NotesSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  // Fetch video details
  const { data: video, isLoading: isLoadingVideo, error: videoError } = useQuery({
    queryKey: ['video'],
    queryFn: fetchVideoDetails,
  });

  // Fetch video comments
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments'],
    queryFn: fetchVideoComments,
    enabled: !!video, // Only fetch comments if video data is available
  });

  // Fetch notes for the video
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes', video?.id],
    queryFn: () => fetchNotes(video?.id),
    enabled: !!video?.id, // Only fetch notes if video ID is available
  });

  if (isLoadingVideo) {
    return <div className="flex items-center justify-center h-96">Loading video details...</div>;
  }

  if (videoError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-destructive">
        <h2 className="text-xl font-bold">Error loading video</h2>
        <p>{videoError.message || 'Could not load video details. Please try again.'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">YouTube Companion Dashboard</h1>
      
      <div className="grid gap-8 md:grid-cols-[3fr_2fr] lg:grid-cols-[2fr_1fr]">
        {/* Video details section */}
        <div>
          <VideoCard video={video} />
        </div>

        {/* Tabs for Comments and Notes */}
        <div>
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comments" className="mt-4">
              <CommentSection 
                comments={comments || []} 
                isLoading={isLoadingComments} 
                videoId={video?.id} 
              />
            </TabsContent>
            
            <TabsContent value="notes" className="mt-4">
              <NotesSection 
                notes={notes || []} 
                isLoading={isLoadingNotes} 
                videoId={video?.id} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
