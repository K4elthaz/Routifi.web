import { useState, useEffect } from 'react'
import { Clock, User, X, Check, Hourglass } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Lead } from '@/types/lead'
import { getLeadHistory } from '@/api/leadsAPI'

// Define a type for lead history events
interface LeadHistoryEvent {
  id: string;
  date: string;
  type: string;
  status: string;
  description: string;
  userResponseTime: number | null;
  agent: {
    name: string;
    avatar: string;
  } | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'assigned': return 'bg-blue-500';
    case 'expired': return 'bg-amber-500';
    case 'rejected': return 'bg-red-500';
    case 'accepted': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'assigned': return <User className="h-4 w-4" />;
    case 'expired':
    case 'rejected': return <X className="h-4 w-4" />;
    case 'accepted': return <Check className="h-4 w-4" />;
    default: return <User className="h-4 w-4" />;
  }
}

interface LeadHistoryDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

export function LeadHistoryDialog({ lead, isOpen, onClose }: LeadHistoryDialogProps) {
  const [leadHistory, setLeadHistory] = useState<LeadHistoryEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && lead?.id) {
      fetchLeadHistory(lead.id);
    }
  }, [isOpen, lead]);

  const fetchLeadHistory = async (leadId: string) => {
    setLoading(true);
    setError(null);
    try {
      const historyData = await getLeadHistory(leadId);
      setLeadHistory(
        historyData.map((event: any) => ({
          id: event.id,
          date: event.created_at,
          type: event.action,
          status: event.action,
          description: `Lead ${event.action}`,
          userResponseTime: event.user_response_time,
          agent: event.user ? { name: event.user, avatar: '/placeholder.svg?height=40&width=40' } : null,
        }))
      );
    } catch (err) {
      setError('Failed to fetch lead history');
    } finally {
      setLoading(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Lead History</DialogTitle>
            <Badge className={`${getStatusColor(leadHistory[0]?.status || 'unknown')}`}>
              {leadHistory[0]?.status?.charAt(0).toUpperCase() + leadHistory[0]?.status?.slice(1) || 'Unknown'}
            </Badge>
          </div>
          <DialogDescription>
            Assignment and outcome history of {lead.name}
          </DialogDescription>
        </DialogHeader>

        {/* Show loading/error states while history is being fetched */}
        {loading ? (
          <p className="text-center text-muted-foreground">Loading history...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* Lead Info Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg?height=48&width=48" alt={lead.name} />
                  <AvatarFallback>
                    {lead.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{lead.name}</h3>
                  <p className="text-sm text-muted-foreground">{lead.tags || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{lead.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{lead.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{lead.location || 'N/A'}</span>
                </div>
                <Separator />
              </div>
            </div>

            {/* Lead History Timeline */}
            <div className="md:col-span-2">
              <h3 className="font-medium mb-4">Assignment Timeline</h3>
              <div className="space-y-6">
                {leadHistory.map((event, index) => (
                  <div key={event.id} className="relative pl-6">
                    {index < leadHistory.length - 1 && (
                      <div className="absolute left-[11px] top-[24px] bottom-0 w-[2px] bg-border" />
                    )}
                    <div className={`absolute left-0 top-1 h-6 w-6 rounded-full ${getStatusColor(event.status)} flex items-center justify-center text-white`}>
                      {getTypeIcon(event.type)}
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="font-normal">
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </Badge>
                        <div className="flex items-center text-muted-foreground text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(event.date).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                          })}
                        </div>
                      </div>
                      {event.userResponseTime !== null && (
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Hourglass className="h-4 w-4 mr-1" />
                          Response Time: {event.userResponseTime} min
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
