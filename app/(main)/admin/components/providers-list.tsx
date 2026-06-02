'use client';

import {
  Building2, ChevronLeft, ChevronRight, Copy, Loader2,
  Mail, Phone, Plus, ShieldOff, ShieldCheck,
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { createProvider, toggleUserActive } from '@/actions/admin';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Money } from '@toneflix/money';
import { alova } from '@/lib/alova';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { usePagination } from 'alova/client';
import { useState } from 'react';

const getProviders = () => (page?: number, limit?: number) =>
    alova.Get<{ data: any[]; meta: any }>('/api/admin/providers', { params: { page, limit } });

export function ProvidersList() {
  const { loading, update, data, page, total, pageCount, isLastPage, refresh } =
    usePagination(getProviders(), {
      immediate: true,
      initialData: { data: [], meta: { totalCount: 0 } },
      total: (r) => r.meta.totalCount,
      initialPageSize: 10,
    });

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', facilityName: '' });

  // Suspend dialog
  const [suspendTarget, setSuspendTarget] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [toggling, setToggling] = useState(false);

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('First name, last name and email are required');
      return;
    }
    setCreating(true);
    try {
      const result = await createProvider(form);
      setCreated({ email: result.email, password: result.password });
      setForm({ firstName: '', lastName: '', email: '', phone: '', facilityName: '' });
      refresh();
    } catch (err) { toast.error((err as Error).message); }
    finally { setCreating(false); }
  };

  const handleToggleActive = async (provider: any, activate: boolean) => {
    setToggling(true);
    try {
      await toggleUserActive(provider.id, activate, activate ? '' : suspendReason);
      toast.success(activate ? `${provider.firstName} reactivated` : `${provider.firstName} suspended`);
      setSuspendTarget(null);
      setSuspendReason('');
      refresh();
    } catch (err) { toast.error((err as Error).message); }
    finally { setToggling(false); }
  };

  return (
    <div className="space-y-4">
      <Card className="border-emerald-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-emerald-400" />
                Healthcare Providers ({total})
              </CardTitle>
              <CardDescription>Create and manage provider accounts</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowCreate(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-1" /> Add Provider
            </Button>
          </div>
        </CardHeader>

        {/* Create Dialog */}
        <Dialog open={showCreate} onOpenChange={(o) => { setShowCreate(o); if (!o) setCreated(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Healthcare Provider</DialogTitle>
              <DialogDescription>Creates a provider account with full dashboard access.</DialogDescription>
            </DialogHeader>
            {created ? (
              <div className="space-y-4 py-2">
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-emerald-400">Provider account created!</p>
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
                <div className="space-y-1">
                  <Label>Facility / Clinic Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input placeholder="e.g. Kuje General Clinic" value={form.facilityName} onChange={e => setForm(f => ({ ...f, facilityName: e.target.value }))} disabled={creating} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Contact First Name</Label>
                    <Input placeholder="John" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} disabled={creating} />
                  </div>
                  <div className="space-y-1">
                    <Label>Contact Last Name</Label>
                    <Input placeholder="Doe" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} disabled={creating} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" placeholder="clinic@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={creating} />
                </div>
                <div className="space-y-1">
                  <Label>Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input placeholder="08012345678" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={creating} />
                </div>
                <DialogFooter className="pt-2">
                  <Button variant="outline" onClick={() => setShowCreate(false)} disabled={creating}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
                    {creating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</> : 'Create Provider'}
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
              <DialogTitle>Suspend Provider</DialogTitle>
              <DialogDescription>
                {suspendTarget?.firstName} {suspendTarget?.lastName} will lose access to their dashboard immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label>Reason <span className="text-muted-foreground text-xs">(shown to provider)</span></Label>
                <Textarea
                  placeholder="e.g. Pending compliance review…"
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSuspendTarget(null)} disabled={toggling}>Cancel</Button>
              <Button
                onClick={() => handleToggleActive(suspendTarget, false)}
                disabled={toggling || !suspendReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {toggling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldOff className="h-4 w-4 mr-2" />}
                Suspend
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-muted/10">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="flex-1 space-y-2"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-4 w-1/2" /></div>
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-10">
              <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No providers yet — click "Add Provider" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((provider) => (
                <Card
                  key={provider.id}
                  className={`border transition-all ${provider.isActive ? 'border-emerald-900/20 hover:border-emerald-700/30' : 'border-red-900/30 bg-red-950/5'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-full p-2 mt-0.5 ${provider.isActive ? 'bg-emerald-900/20' : 'bg-red-900/20'}`}>
                          <Building2 className={`h-5 w-5 ${provider.isActive ? 'text-emerald-400' : 'text-red-400'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-white">
                              {provider.name || `${provider.firstName} ${provider.lastName}`}
                            </p>
                            <Badge
                              variant="outline"
                              className={provider.isActive
                                ? 'bg-emerald-900/20 border-emerald-900/30 text-emerald-400 text-xs'
                                : 'bg-red-900/20 border-red-900/30 text-red-400 text-xs'}
                            >
                              {provider.isActive ? 'Active' : 'Suspended'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{provider.email}</span>
                            {provider.phoneNumber && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{provider.phoneNumber}</span>}
                            {provider.bankName && <span className="text-emerald-400/70">Bank: {provider.bankName}</span>}
                          </div>
                          {!provider.isActive && provider.suspendedReason && (
                            <p className="text-xs text-red-400 mt-1 italic">"{provider.suspendedReason}"</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined {format(new Date(provider.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                        {provider.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSuspendTarget(provider)}
                            disabled={toggling}
                            className="border-red-900/30 text-red-400 hover:bg-red-950/20 text-xs"
                          >
                            <ShieldOff className="h-3.5 w-3.5 mr-1" /> Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleToggleActive(provider, true)}
                            disabled={toggling}
                            className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                          >
                            {toggling ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <ShieldCheck className="h-3.5 w-3.5 mr-1" />}
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {data.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                  <p className="text-sm text-muted-foreground">Page {page || 1} of {pageCount || 1}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => update({ page: page - 1 })} disabled={loading || page === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => update({ page: page + 1 })} disabled={loading || isLastPage}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
