import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoWidget() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Review dashboard design', completed: true },
    { id: '2', text: 'Finalize Q3 metrics', completed: false },
    { id: '3', text: 'Schedule team meeting', completed: false },
    { id: '4', text: 'Update project timeline', completed: false },
  ]);
  const [newTodo, setNewTodo] = useState('');
  const { toast } = useToast();
  
  const addTodo = () => {
    if (!newTodo.trim()) return;
    
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
    };
    
    setTodos([...todos, todo]);
    setNewTodo('');
    
    toast({
      title: "Task added",
      description: "Your new task has been added to the list.",
    });
  };
  
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  const removeTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    
    toast({
      title: "Task removed",
      description: "The task has been removed from your list.",
      variant: "destructive",
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };
  
  return (
    <Card className="shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      <CardContent className="p-4 relative">
        <div className="flex items-center space-x-2 mb-3">
          <Input
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-white/5 border-white/10 backdrop-blur-sm focus:bg-white/10"
          />
          <Button 
            size="sm" 
            onClick={addTodo}
            className="bg-primary/90 hover:bg-primary transition-colors backdrop-blur-sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-h-[120px] overflow-y-auto hide-scrollbar">
          <AnimatePresence>
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center justify-between p-2 rounded-md border border-white/10 ${
                  todo.completed ? 'bg-white/5' : 'bg-white/10'
                } backdrop-blur-sm hover:bg-white/15 transition-all duration-200 group`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <Checkbox
                    id={todo.id}
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="transition-transform duration-200 hover:scale-110"
                  />
                  <label
                    htmlFor={todo.id}
                    className={`text-sm cursor-pointer truncate ${
                      todo.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {todo.text}
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTodo(todo.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {todos.length === 0 && (
            <div className="text-center py-2 text-muted-foreground text-sm col-span-full backdrop-blur-sm">
              No tasks yet. Add some tasks to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}