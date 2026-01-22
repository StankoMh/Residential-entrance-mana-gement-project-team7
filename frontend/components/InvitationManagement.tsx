import { useState, useEffect } from 'react';
import invitationService, { InvitationRequest, InvitationResponse } from '../services/invitationService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Copy, Mail, Trash2, RefreshCw } from 'lucide-react';

interface InvitationManagementProps {
    buildingId: number;
    units: { id: number; unitNumber: string }[];
}

const InvitationManagement = ({ buildingId, units }: InvitationManagementProps) => {
    const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState<InvitationRequest>({
        email: '',
        unitId: 0,
        role: 'RESIDENT',
    });

    const fetchInvitations = async () => {
        try {
            const data = await invitationService.getInvitationsByBuilding(buildingId);
            setInvitations(data);
        } catch (error) {
            toast.error('Failed to fetch invitations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, [buildingId]);

    const handleCreateInvitation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await invitationService.createInvitation(formData);
            toast.success('Invitation sent successfully');
            setDialogOpen(false);
            setFormData({ email: '', unitId: 0, role: 'RESIDENT' });
            fetchInvitations();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send invitation');
        }
    };

    const handleResend = async (id: number) => {
        try {
            await invitationService.resendInvitation(id);
            toast.success('Invitation resent successfully');
            fetchInvitations();
        } catch (error) {
            toast.error('Failed to resend invitation');
        }
    };

    const handleCancel = async (id: number) => {
        try {
            await invitationService.cancelInvitation(id);
            toast.success('Invitation cancelled');
            fetchInvitations();
        } catch (error) {
            toast.error('Failed to cancel invitation');
        }
    };

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        toast.success('Invitation link copied to clipboard');
    };

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING':
                return <Badge variant="outline">Pending</Badge>;
            case 'ACCEPTED':
                return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
            case 'EXPIRED':
                return <Badge variant="destructive">Expired</Badge>;
            case 'CANCELLED':
                return <Badge variant="secondary">Cancelled</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Invitation Management</CardTitle>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Invitation
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Send New Invitation</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateInvitation} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="resident@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit</Label>
                                <Select
                                    value={formData.unitId.toString()}
                                    onValueChange={(value) => setFormData({ ...formData, unitId: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                Unit {unit.unitNumber}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RESIDENT">Resident</SelectItem>
                                        <SelectItem value="OWNER">Owner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full">
                                Send Invitation
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invitations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No invitations found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invitations.map((invitation) => (
                                    <TableRow key={invitation.id}>
                                        <TableCell>{invitation.email}</TableCell>
                                        <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                                        <TableCell>
                                            {new Date(invitation.expiresAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {invitation.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => copyLink(invitation.invitationLink)}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleResend(invitation.id)}
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleCancel(invitation.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

export default InvitationManagement;