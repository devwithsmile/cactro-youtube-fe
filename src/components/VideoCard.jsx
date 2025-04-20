import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { VideoRating } from "./VideoRating";

export function VideoCard({ video }) {
  if (!video) return null;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{video.title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {video.channelTitle}
            </CardDescription>
          </div>
          <Avatar>
            <AvatarImage src={video.thumbnails?.default?.url} alt={video.title} />
            <AvatarFallback>{video.channelTitle[0]}</AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${video.id}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {video.description}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-secondary/50 p-2 rounded-md">
            <div className="text-xl font-bold">{video.statistics?.viewCount || 0}</div>
            <div className="text-xs">Views</div>
          </div>
          <div className="bg-secondary/50 p-2 rounded-md">
            <div className="text-xl font-bold">{video.statistics?.likeCount || 0}</div>
            <div className="text-xs">Likes</div>
          </div>
          <div className="bg-secondary/50 p-2 rounded-md">
            <div className="text-xl font-bold">{video.statistics?.commentCount || 0}</div>
            <div className="text-xs">Comments</div>
          </div>
          <div className="bg-secondary/50 p-2 rounded-md">
            <div className="text-xl font-bold">{new Date(video.publishedAt).toLocaleDateString()}</div>
            <div className="text-xs">Published</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <VideoRating />
        <div className="flex items-center gap-2">
          <Button variant="outline">Edit Details</Button>
          <Button variant="default">Manage Comments</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
