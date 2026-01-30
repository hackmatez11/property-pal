import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Sparkles, Building2, MapPin, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: "Hi! I'm your AI property assistant. Tell me what you're looking for, like:\n\n• \"2BHK under 50 lakhs in Bangalore\"\n• \"Commercial space near metro\"\n• \"Villa with garden in Delhi\"",
    suggestions: ['2BHK in Bangalore', 'Office space in Pune', 'Villa under 2Cr'],
  },
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I found some great options for "${text}"! Here are properties that match your criteria:\n\n✓ 3 properties in your budget\n✓ Close to metro stations\n✓ Good connectivity\n\nWould you like me to show you the details?`,
        suggestions: ['Show all results', 'Filter by price', 'Compare properties'],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group',
          isOpen && 'scale-0 opacity-0'
        )}
      >
        <MessageCircle className="w-6 h-6 text-accent-foreground" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-success-foreground" />
        </span>
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="bg-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">AI Property Assistant</h3>
              <p className="text-xs text-primary-foreground/70">Ask me anything about properties</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3',
                  message.type === 'user'
                    ? 'bg-accent text-accent-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                )}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                {message.suggestions && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSend(suggestion)}
                        className="px-3 py-1.5 text-xs font-medium bg-background hover:bg-secondary rounded-full border border-border transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-border">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors">
              <Building2 className="w-3 h-3" />
              Residential
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors">
              <MapPin className="w-3 h-3" />
              Near Metro
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors">
              <Banknote className="w-3 h-3" />
              Under 50L
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your property requirements..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border-0 focus:ring-2 focus:ring-accent text-sm placeholder:text-muted-foreground"
            />
            <Button type="submit" variant="accent" size="icon" className="rounded-xl">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
