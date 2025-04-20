import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addNote, updateNote, deleteNote } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PencilIcon, TrashIcon } from '@/components/ui/icons';

export function NotesSection({ notes = [], isLoading, videoId }) {
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const queryClient = useQueryClient();

  // Add a new note
  const addNoteMutation = useMutation({
    mutationFn: ({ videoId, content }) => addNote(videoId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', videoId] });
      setNewNote('');
    },
  });

  // Update a note
  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }) => updateNote(noteId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', videoId] });
      setEditingNote(null);
      setEditedContent('');
    },
  });

  // Delete a note
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', videoId] });
    },
  });

  const handleAddNote = () => {
    if (!newNote.trim() || !videoId) return;
    addNoteMutation.mutate({
      videoId,
      content: newNote,
    });
  };

  const handleStartEdit = (note) => {
    setEditingNote(note.id);
    setEditedContent(note.content);
  };

  const handleUpdateNote = () => {
    if (!editedContent.trim()) return;
    updateNoteMutation.mutate({
      noteId: editingNote,
      content: editedContent,
    });
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditedContent('');
  };

  if (isLoading) {
    return <div className="p-4">Loading notes...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Note Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note about the video..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-20"
              />
              <Button 
                onClick={handleAddNote}
                disabled={!newNote.trim() || !videoId || addNoteMutation.isPending}
              >
                {addNoteMutation.isPending ? 'Saving...' : 'Save Note'}
              </Button>
            </div>

            {/* Notes List */}
            {notes.length > 0 ? (
              <div className="space-y-4 mt-6">
                {notes.map((note) => (
                  <Card key={note.id} className="overflow-hidden">
                    {editingNote === note.id ? (
                      <>
                        <CardContent className="pt-6">
                          <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="min-h-20"
                          />
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 pt-0">
                          <Button variant="outline" size="sm" onClick={cancelEdit}>
                            Cancel
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleUpdateNote}
                            disabled={!editedContent.trim() || updateNoteMutation.isPending}
                          >
                            {updateNoteMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                        </CardFooter>
                      </>
                    ) : (
                      <>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs text-muted-foreground">
                              {new Date(note.createdAt).toLocaleString()}
                            </p>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleStartEdit(note)}>
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)}>
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="whitespace-pre-line">{note.content}</p>
                        </CardContent>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No notes yet. Add some notes to help improve your video!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
