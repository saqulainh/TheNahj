"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Users, Shield, UserX, Search, ShieldCheck } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  role: "super_admin" | "editor" | "contributor";
  lastActive: string;
}

const initialUsers: AdminUser[] = [
  { id: "u1", email: "admin@thenahj.com", role: "super_admin", lastActive: "Just now" },
  { id: "u2", email: "editor@thenahj.com", role: "editor", lastActive: "2 hours ago" },
  { id: "u3", email: "writer@thenahj.com", role: "contributor", lastActive: "2 days ago" },
];

export default function UsersRoleManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"super_admin" | "editor" | "contributor">("contributor");

  const changeRole = (id: string, role: "super_admin" | "editor" | "contributor") => {
    setUsers(users.map((u) => (u.id === id ? { ...u, role } : u)));
    setStatus(`Updated user's permission class structure successfully.`);
  };

  const inviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const user: AdminUser = {
      id: `u_${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      lastActive: "Never",
    };

    setUsers([...users, user]);
    setInviteEmail("");
    setStatus(`Verification handshake token dispatched to ${inviteEmail}.`);
  };

  const revokeAccess = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    setStatus("Administrative role credentials revoked.");
  };

  const filtered = users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Users className="h-8 w-8 text-gold" />
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Role-Based Access Control (RBAC)</h1>
          <p className="mt-1 text-sm text-muted">Grant administrative scopes, dispatch verification handshakes, and manage editors.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Invitation Panel */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-surface p-6 space-y-6 self-start">
          <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold-muted" /> Dispatch Handshake
          </h2>

          <form onSubmit={inviteUser} className="space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Collaborator Email</span>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="editor@thenahj.com"
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Assigned Scopes</span>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none text-muted"
              >
                <option value="contributor">Contributor (Drafts only)</option>
                <option value="editor">Editor (Publish / Modify)</option>
                <option value="super_admin">Super Admin (All Nodes)</option>
              </select>
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-gold/15 py-3 text-xs font-semibold text-gold-light hover:bg-gold/25 transition-colors border border-gold/25"
            >
              Dispatch Authentication Tokens
            </button>
          </form>
        </div>

        {/* Directory Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted/65" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search directory by email..."
              className="w-full rounded-xl border border-border bg-surface pl-11 pr-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-muted">
                <thead className="bg-background text-xs uppercase text-gold-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User Ident</th>
                    <th className="px-6 py-4 font-semibold">Credential Class</th>
                    <th className="px-6 py-4 font-semibold">Active Cycle</th>
                    <th className="px-6 py-4 font-semibold text-right">Scope Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-background/40">
                      <td className="px-6 py-4 font-medium text-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user.id, e.target.value as any)}
                          className="bg-transparent border-0 font-semibold text-gold-light text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="contributor" className="bg-surface text-foreground">Contributor</option>
                          <option value="editor" className="bg-surface text-foreground">Editor</option>
                          <option value="super_admin" className="bg-surface text-foreground">Super Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">{user.lastActive}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => revokeAccess(user.id)}
                          className="text-red-400 hover:text-red-300 inline-flex items-center gap-1 text-xs"
                          title="Revoke active class access credentials"
                        >
                          <UserX size={14} /> Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {status && (
        <div className="rounded-lg bg-surface p-4 text-xs text-gold-muted border border-border">
          {status}
        </div>
      )}
    </div>
  );
}
