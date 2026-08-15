import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Users,
  Search,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  LogOut,
  ShieldCheck,
  MoreHorizontal,
  UserRound,
  Shield,
  Activity,
  UserCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

import {
  fetchAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  type User,
} from "@/api/admin";

const USERS_PER_PAGE = 10;

export function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  /*
   * Load users
   */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAllUsers();
      setUsers(data);
      setCurrentPage(1);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch users.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Initial authentication / load
   */
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    void loadUsers();
  }, [navigate, loadUsers]);

  /*
   * Role update
   */
  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoadingId(userId);

    try {
      const updated = await updateUserRole(userId, newRole);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: updated.role,
              }
            : user,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setActionLoadingId(null);
    }
  };

  /*
   * Status update
   */
  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    setActionLoadingId(userId);

    try {
      const updated = await updateUserStatus(userId, !currentStatus);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                is_active: updated.is_active,
              }
            : user,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  /*
   * Delete user
   */
  const handleDeleteUser = async (userId: string, username: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${username}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setActionLoadingId(userId);

    try {
      await deleteUser(userId);

      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setActionLoadingId(null);
    }
  };

  /*
   * Logout
   */
  const handleLogout = () => {
    localStorage.removeItem("access_token");

    navigate("/login", {
      replace: true,
    });
  };

  /*
   * Filter users
   */
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        query.length === 0 ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      const matchesRole = selectedRole === "all" || user.role === selectedRole;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && user.is_active) ||
        (selectedStatus === "inactive" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  /*
   * Pagination
   */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE),
  );

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;

    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  /*
   * Keep page valid after filtering/deleting
   */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /*
   * Metrics
   */
  const totalUsers = users.length;

  const activeUsers = users.filter((user) => user.is_active).length;

  const inactiveUsers = totalUsers - activeUsers;

  const adminUsers = users.filter((user) => user.role === "admin").length;

  const activePercentage =
    totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const firstResult =
    filteredUsers.length === 0 ? 0 : (currentPage - 1) * USERS_PER_PAGE + 1;

  const lastResult = Math.min(
    currentPage * USERS_PER_PAGE,
    filteredUsers.length,
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <header className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                <ShieldAlert className="size-6 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Admin Panel
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Manage users, roles, and account access.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => void loadUsers()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw
                className={`size-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="size-4" />
              Log Out
            </Button>
          </div>
        </header>

        {/* =====================================================
            METRICS
        ===================================================== */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Accounts
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {totalUsers}
                </p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Registered application users
            </p>
          </div>

          {/* Active */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Users
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {activeUsers}
                </p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <UserCheck className="size-5 text-emerald-500" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {activePercentage}% of all accounts
            </p>
          </div>

          {/* Inactive */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Inactive Users
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {inactiveUsers}
                </p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10">
                <UserX className="size-5 text-destructive" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Accounts without active access
            </p>
          </div>

          {/* Admins */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Administrators
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {adminUsers}
                </p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <ShieldCheck className="size-5 text-indigo-500" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Users with elevated privileges
            </p>
          </div>
        </section>

        {/* =====================================================
            FILTERS
        ===================================================== */}
        <section className="mt-7 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search by username, email, or ID..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={selectedRole}
                onChange={(event) => {
                  setSelectedRole(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="user">Users</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Filter summary */}
          <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <Activity className="size-3.5" />

            <span>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredUsers.length}
              </span>{" "}
              matching users
            </span>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}
        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />

            <div>
              <p className="font-semibold">Failed to load users</p>

              <p className="mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* =====================================================
            USER TABLE
        ===================================================== */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          {/* Table header */}
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold">User Directory</h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Manage application accounts and permissions.
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <UserCog className="size-3.5" />
              Administrator controls
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border/70 bg-muted/30">
                <tr className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3.5">User</th>

                  <th className="px-6 py-3.5">Role</th>

                  <th className="px-6 py-3.5">Status</th>

                  <th className="px-6 py-3.5">Account ID</th>

                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {/* Loading */}
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <RefreshCw className="size-4 animate-spin text-primary" />
                        Loading user directory...
                      </div>
                    </td>
                  </tr>
                )}

                {/* Empty */}
                {!loading && paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                          <Search className="size-5 text-muted-foreground" />
                        </div>

                        <p className="mt-3 text-sm font-semibold">
                          No users found
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Try adjusting your search or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Users */}
                {!loading &&
                  paginatedUsers.map((user) => {
                    const isProcessing = actionLoadingId === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="group transition-colors hover:bg-muted/20"
                      >
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold uppercase">
                              {user.username.slice(0, 2)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">
                                {user.username}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.role === "admin" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-500">
                                <ShieldCheck className="size-3.5" />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                                <UserRound className="size-3.5" />
                                User
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-500">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive">
                              <span className="size-1.5 rounded-full bg-destructive" />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* ID */}
                        <td className="px-6 py-4">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {user.id}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu
                            align="right"
                            trigger={
                              <Button
                                variant="outline"
                                size="icon-xs"
                                disabled={isProcessing}
                                className="opacity-70 transition-opacity group-hover:opacity-100"
                              >
                                {isProcessing ? (
                                  <RefreshCw className="size-3.5 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="size-4" />
                                )}
                              </Button>
                            }
                            sections={[
                              {
                                title: "Role",
                                items: [
                                  {
                                    id: "make-user",
                                    label: "Make User",
                                    icon: <UserRound className="size-4" />,
                                    disabled: user.role === "user",
                                    onClick: () =>
                                      void handleRoleChange(user.id, "user"),
                                  },
                                  {
                                    id: "make-admin",
                                    label: "Make Admin",
                                    icon: <Shield className="size-4" />,
                                    disabled: user.role === "admin",
                                    onClick: () =>
                                      void handleRoleChange(user.id, "admin"),
                                  },
                                ],
                              },
                              {
                                title: "Account",
                                items: [
                                  {
                                    id: "toggle-status",
                                    label: user.is_active
                                      ? "Deactivate User"
                                      : "Activate User",
                                    icon: user.is_active ? (
                                      <UserX className="size-4" />
                                    ) : (
                                      <UserCheck className="size-4" />
                                    ),
                                    onClick: () =>
                                      void handleStatusToggle(
                                        user.id,
                                        user.is_active,
                                      ),
                                  },
                                ],
                              },
                              {
                                items: [
                                  {
                                    id: "delete",
                                    label: "Delete User",
                                    icon: <Trash2 className="size-4" />,
                                    destructive: true,
                                    onClick: () =>
                                      void handleDeleteUser(
                                        user.id,
                                        user.username,
                                      ),
                                  },
                                ],
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* ===================================================
              PAGINATION
          =================================================== */}
          {!loading && filteredUsers.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {firstResult}
                </span>
                {" – "}
                <span className="font-semibold text-foreground">
                  {lastResult}
                </span>
                {" of "}
                <span className="font-semibold text-foreground">
                  {filteredUsers.length}
                </span>{" "}
                users
              </p>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
