'use client';

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { getAgentMembers } from '@/lib/requests/agent-members';
import { usePagination } from 'alova/client';

export function AgentMembersList() {
  const { update, loading, data, page, total, pageSize, isLastPage } =
    usePagination(getAgentMembers(), {
      immediate: true,
      initialData: { data: [], meta: { totalCount: 0 } },
      initialPageSize: 10,
      total: (response) => response.meta.totalCount,
    });

  return (
    <div className="space-y-4">
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-emerald-400" />
            My Registered Members ({total})
          </CardTitle>
          <CardDescription>
            View and manage members you've registered
          </CardDescription>
        </CardHeader>
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
              No members registered yet
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((member) => {
                const isActive =
                  member.subscriptionEnd &&
                  new Date(member.subscriptionEnd) > new Date();
                return (
                  <Card
                    key={member.id}
                    className="bg-background border-emerald-900/20 hover:border-emerald-700/30 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-muted/20 rounded-full p-2 mt-1">
                            <User className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-white">
                                {member.firstName} {member.lastName}
                              </h3>
                              <Badge
                                variant="outline"
                                className={
                                  isActive
                                    ? 'bg-emerald-900/20 border-emerald-900/30 text-emerald-400'
                                    : 'bg-red-900/20 border-red-900/30 text-red-400'
                                }
                              >
                                {isActive ? 'Active' : 'Expired'}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {member.email}
                              </div>
                              {member.phoneNumber && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {member.phoneNumber}
                                </div>
                              )}
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Joined{' '}
                                {format(
                                  new Date(member.createdAt),
                                  'MMM d, yyyy',
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Member ID: {member.membershipId}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="text-right">
                            <div className="flex items-center text-emerald-400 font-medium">
                              <CreditCard className="h-4 w-4 mr-1" />
                              {member.credits} credits
                            </div>
                            {member.subscriptionEnd && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {isActive ? 'Expires' : 'Expired'}:{' '}
                                {format(
                                  new Date(member.subscriptionEnd),
                                  'MMM d, yyyy',
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {data.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page} of {pageSize || 1}
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
