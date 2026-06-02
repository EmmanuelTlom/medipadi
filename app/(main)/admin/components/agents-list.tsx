'use client';

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  Wallet,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Money } from '@toneflix/money';
import { Skeleton } from '@/components/ui/skeleton';
import { createTestAgent, toggleUserActive } from '@/actions/admin';
import { format } from 'date-fns';
import { getAgents } from '@/lib/requests/agents';
import { toast } from 'sonner';
import { usePagination } from 'alova/client';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export function AgentsList() {
  const { loading, update, data, page, total, pageCount, isLastPage, refresh } =
    usePagination(getAgents(), {
      immediate: true,
      initialData: { data: [], meta: { totalCount: 0 } },
      total: (response) => response.meta.totalCount,
      initialPageSize: 10,
    });

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const [suspendTarget, setSuspendTarget] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [toggling, setToggling] = useState(false);

  const handleToggleActive = async (agent: any, activate: boolean) => {
    setToggling(true);
    try {
      await toggleUserActive(agent.id, activate, activate ? '' : suspendReason);
      toast.success(activate ? `${agent.firstName} reactivated` : `${agent.firstName} suspended`);
      setSuspendTarget(null);
      setSuspendReason('');
      refresh();
    } catch (err) { toast.error((err as Error).message); }
    finally { setToggling(false); }
  };

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('First name, last name and email are required');
      return;
    }
    setCreating(true);
    try {
      const result = await createTestAgent(form);
      setCreated({ email: result.email, password: result.password });
      setForm({ firstName: '', lastName: '', email: '', phone: '' });
      refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-emerald-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-emerald-400" />
                All Agents ({total})
              </CardTitle>
              <CardDescription>Review and manage agent accounts</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowCreate(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-1" /> Create Agent
            </Button>
          </div>
        </CardHeader>

      {/* Create Agent Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => { setShowCreate(o); if (!o) { setCreated(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Agent Account</DialogTitle>
            <DialogDescription>Creates a Clerk account + DB record with ₦5,000 starter wallet balance.</DialogDescription>
          </DialogHeader>
          {created ? (
            <div className="space-y-4 py-2">
              <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-emerald-400">Account created successfully!</p>
                {[{ label: 'Email', value: created.email }, { label: 'Password', value: created.password }].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between bg-muted/10 rounded p-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-white font-mono text-sm">{value}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(value); toast.success(`${label} copied`); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-amber-400">Save these credentials — the password won't be shown again.</p>
              </div>
              <DialogFooter>
                <Button onClick={() => { setShowCreate(false); setCreated(null); }} className="w-full">Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>First Name</Label>
                  <Input placeholder="John" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} disabled={creating} />
                </div>
                <div className="space-y-1">
                  <Label>Last Name</Label>
                  <Input placeholder="Doe" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} disabled={creating} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" placeholder="agent@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={creating} />
              </div>
              <div className="space-y-1">
                <Label>Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input placeholder="08012345678" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={creating} />
              </div>
              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setShowCreate(false)} disabled={creating}>Cancel</Button>
                <Button onClick={handleCreate} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
                  {creating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</> : 'Create Agent'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
        {/* Suspend Dialog */}
        <Dialog open={!!suspendTarget} onOpenChange={(o) => { if (!o) { setSuspendTarget(null); setSuspendReason(''); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Agent</DialogTitle>
              <DialogDescription>
                {suspendTarget?.firstName} {suspendTarget?.lastName} will lose access to their dashboard immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label>Reason</Label>
                <Textarea placeholder="e.g. Compliance review…" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSuspendTarget(null)} disabled={toggling}>Cancel</Button>
              <Button onClick={() => handleToggleActive(suspendTarget, false)} disabled={toggling || !suspendReason.trim()} className="bg-red-600 hover:bg-red-700">
                {toggling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldOff className="h-4 w-4 mr-2" />} Suspend
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-background border-emerald-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-9 h-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <Skeleton className="h-12 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agents found
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((agent) => (
                <Card
                  key={agent.id}
                  className={`transition-all ${agent.isActive !== false ? 'border-emerald-900/20 hover:border-emerald-700/30' : 'border-red-900/30 bg-red-950/5'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-full p-2 mt-1 ${agent.isActive !== false ? 'bg-muted/20' : 'bg-red-900/20'}`}>
                          <UserCheck className={`h-5 w-5 ${agent.isActive !== false ? 'text-emerald-400' : 'text-red-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-white">{agent.firstName} {agent.lastName}</h3>
                            <Badge variant="outline" className={agent.isActive !== false
                              ? 'bg-emerald-900/20 border-emerald-900/30 text-emerald-400 text-xs'
                              : 'bg-red-900/20 border-red-900/30 text-red-400 text-xs'}>
                              {agent.isActive !== false ? 'Active' : 'Suspended'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{agent.email}</span>
                            {agent.phoneNumber && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{agent.phoneNumber}</span>}
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {format(new Date(agent.createdAt), 'MMM d, yyyy')}</span>
                            {agent._count && <span>{agent._count.registeredMembers} member{agent._count.registeredMembers !== 1 ? 's' : ''}</span>}
                          </div>
                          {agent.isActive === false && agent.suspendedReason && (
                            <p className="text-xs text-red-400 mt-1 italic">"{agent.suspendedReason}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end lg:self-center">
                        <div className="text-right">
                          <div className="flex items-center text-emerald-400 font-medium text-sm">
                            <Wallet className="h-4 w-4 mr-1" />
                            {Money.format(agent.walletBalance || 0)}
                          </div>
                          <p className="text-xs text-muted-foreground">Wallet</p>
                        </div>
                        {agent.isActive !== false ? (
                          <Button variant="outline" size="sm" onClick={() => setSuspendTarget(agent)} disabled={toggling}
                            className="border-red-900/30 text-red-400 hover:bg-red-950/20 text-xs">
                            <ShieldOff className="h-3.5 w-3.5 mr-1" /> Suspend
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleToggleActive(agent, true)} disabled={toggling}
                            className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                            {toggling ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <ShieldCheck className="h-3.5 w-3.5 mr-1" />}
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {data.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page || 1} of {pageCount || 1}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => update({ page: page - 1 })}
                  disabled={loading || page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => update({ page: page + 1 })}
                  disabled={loading || isLastPage}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
