'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/scroll-animations'
import { cn } from '@/lib/utils'
import {
  ShieldCheckIcon,
  UserGroupIcon,
  PhotoIcon,
  UserPlusIcon,
  InboxArrowDownIcon,
  CheckBadgeIcon,
  ClockIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { appendStoredWallpaper, loadStoredWallpapers, type WallpaperEntry } from '@/lib/wallpaper-store'

type DeviceType = 'desktop' | 'mobile'

const mockUsers = [
  {
    id: 'u-001',
    name: 'Lay Foster',
    email: 'lay@voidwallz.com',
    role: 'Owner',
    status: 'Active',
    wallpapersUploaded: 58,
    lastActive: 'Just now'
  },
  {
    id: 'u-002',
    name: 'Nikhil Sharma',
    email: 'nikhil@voidwallz.com',
    role: 'Admin',
    status: 'Active',
    wallpapersUploaded: 32,
    lastActive: '12 minutes ago'
  },
  {
    id: 'u-003',
    name: 'Mira Santos',
    email: 'mira@voidwallz.com',
    role: 'Moderator',
    status: 'Suspended',
    wallpapersUploaded: 19,
    lastActive: '3 days ago'
  }
]

const mockWallpapers = [
  {
    id: 'w-101',
    title: 'Architectural Shadows',
    category: 'Minimalist',
    status: 'Published',
    curator: 'Lay Foster',
    lastEdit: '1 hour ago',
    previewUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=180&h=120&fit=crop',
    deviceType: 'desktop' as DeviceType,
    featuredUntil: undefined,
    createdAt: '2025-09-26T18:12:00.000Z'
  },
  {
    id: 'w-102',
    title: 'Zero Dawn Horizon',
    category: 'Gaming',
    status: 'Pending Review',
    curator: 'Mira Santos',
    lastEdit: '25 minutes ago',
    previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=180&h=120&fit=crop',
    deviceType: 'desktop' as DeviceType,
    featuredUntil: undefined,
    createdAt: '2025-09-27T17:30:00.000Z'
  },
  {
    id: 'w-103',
    title: 'Hyperloop Dreams',
    category: 'Futuristic',
    status: 'Draft',
    curator: 'Nikhil Sharma',
    lastEdit: 'Yesterday',
    previewUrl: 'https://images.unsplash.com/photo-1604079628040-94301bb21b89?w=180&h=120&fit=crop',
    deviceType: 'desktop' as DeviceType,
    featuredUntil: undefined,
    createdAt: '2025-09-25T08:45:00.000Z'
  }
]

const mockInvites = [
  {
    id: 'inv-901',
    email: 'norah@voidwallz.com',
    role: 'Moderator',
    sent: '2 hours ago',
    status: 'Pending'
  },
  {
    id: 'inv-902',
    email: 'tony@voidwallz.com',
    role: 'Admin',
    sent: 'Yesterday',
    status: 'Accepted'
  }
]

type Role = 'Owner' | 'Admin' | 'Moderator' | 'Support'

type UserRecord = (typeof mockUsers)[number]

type WallpaperRecord = (typeof mockWallpapers)[number]

type InviteRecord = (typeof mockInvites)[number]

type WallpaperStatus = 'Draft' | 'Pending Review' | 'Published'

export default function AdminPage() {
  const [users, setUsers] = useState<UserRecord[]>(mockUsers)
  const [wallpapers, setWallpapers] = useState<WallpaperRecord[]>(mockWallpapers)
  const [invites, setInvites] = useState<InviteRecord[]>(mockInvites)
  const [newInvite, setNewInvite] = useState({ email: '', role: 'Moderator' as Role })
  const [newWallpaper, setNewWallpaper] = useState({
    title: '',
    category: 'Minimalist',
    curator: '',
    status: 'Draft' as WallpaperStatus,
    file: null as File | null,
    previewUrl: '',
    deviceType: 'desktop' as DeviceType
  })
  const [auditLog, setAuditLog] = useState<string[]>([
    '2025-09-27 18:12 • Lay Foster published “Architectural Shadows”',
    '2025-09-27 17:55 • Nikhil Sharma approved Mira Santos as Moderator',
    '2025-09-27 16:38 • Automated backup completed (1.8 GB)'
  ])

  const totalAdmins = useMemo(
    () => users.filter((user) => user.role === 'Owner' || user.role === 'Admin').length,
    [users]
  )

  const totalModerators = useMemo(
    () => users.filter((user) => user.role === 'Moderator').length,
    [users]
  )

  const createInvite = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newInvite.email.trim()) return

    const invite: InviteRecord = {
      id: `inv-${Math.floor(Math.random() * 10_000)}`,
      email: newInvite.email.trim(),
      role: newInvite.role,
      sent: 'Just now',
      status: 'Pending'
    }

    setInvites((prev) => [invite, ...prev])
    setNewInvite({ email: '', role: 'Moderator' })
    setAuditLog((prev) => [
      `2025-09-27 18:45 • Invite sent to ${invite.email} with role ${invite.role}`,
      ...prev
    ])
  }

  const updateUserRole = (id: string, role: Role) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              role,
              status: role === 'Moderator' && user.status === 'Suspended' ? 'Active' : user.status
            }
          : user
      )
    )
    setAuditLog((prev) => [
      `2025-09-27 18:32 • Role changed to ${role} for user ${id}`,
      ...prev
    ])
  }

  const toggleWallpaperStatus = (id: string) => {
    setWallpapers((prev) =>
      prev.map((wallpaper) =>
        wallpaper.id === id
          ? {
              ...wallpaper,
              status: wallpaper.status === 'Published' ? 'Archived' : 'Published'
            }
          : wallpaper
      )
    )
    setAuditLog((prev) => [
      `2025-09-27 18:27 • Wallpaper ${id} status toggled`,
      ...prev
    ])
  }

  useEffect(() => {
    const localWallpapers = loadStoredWallpapers()
    if (localWallpapers.length > 0) {
      setWallpapers((prev) => {
        const existingIds = new Set(prev.map((wp) => wp.id))
        const merged = [...prev]
        localWallpapers.forEach((entry) => {
          if (!existingIds.has(entry.id)) {
            merged.unshift(entry as WallpaperRecord)
          }
        })
        return merged
      })
    }
  }, [])

  const createWallpaper = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newWallpaper.title.trim() || !newWallpaper.curator.trim()) return

    const nowIso = new Date().toISOString()
    const featuredUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const wallpaper: WallpaperRecord = {
      id: `w-${Math.floor(Math.random() * 10_000)}`,
      title: newWallpaper.title.trim(),
      category: newWallpaper.category,
      status: newWallpaper.status,
      curator: newWallpaper.curator.trim(),
      lastEdit: 'Just now',
      previewUrl: newWallpaper.previewUrl ?? 'https://images.unsplash.com/photo-1557683316-973673baf926?w=180&h=120&fit=crop',
      deviceType: newWallpaper.deviceType,
      featuredUntil,
      createdAt: nowIso
    }

    setWallpapers((prev) => [wallpaper, ...prev])
    appendStoredWallpaper(wallpaper as WallpaperEntry)
    if (newWallpaper.previewUrl) {
      URL.revokeObjectURL(newWallpaper.previewUrl)
    }
    setNewWallpaper({ title: '', category: 'Minimalist', curator: '', status: 'Draft', file: null, previewUrl: '', deviceType: newWallpaper.deviceType })
    setAuditLog((prev) => [
      `2025-09-27 18:50 • ${wallpaper.curator} queued “${wallpaper.title}” (${wallpaper.status})`,
      ...prev
    ])
  }

  const handleWallpaperFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      if (newWallpaper.previewUrl) URL.revokeObjectURL(newWallpaper.previewUrl)
      setNewWallpaper((prev) => ({ ...prev, file: null, previewUrl: '' }))
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setNewWallpaper((prev) => ({ ...prev, file, previewUrl }))
  }

  const revokeInvite = (id: string) => {
    setInvites((prev) => prev.filter((invite) => invite.id !== id))
    setAuditLog((prev) => [
      `2025-09-27 18:21 • Invite ${id} revoked`,
      ...prev
    ])
  }

  const totalWallpapers = wallpapers.length
  const pendingWallpapers = wallpapers.filter((item) => item.status !== 'Published').length

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <FadeInUp>
          <div className="text-center">
            <div className="h-[150px] md:h-[200px] flex items-center justify-center mb-6">
              <TextHoverEffect text="ADMIN" className="text-6xl md:text-7xl" />
            </div>
            <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
              Central command for Voidwallz. Review performance, manage roles, and keep wallpapers pristine.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 border-2 border-foreground bg-primary text-background font-mono text-xs uppercase tracking-wide">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Restricted — wire real auth before production launch</span>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-brutalist p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="w-6 h-6" />
                <h3 className="font-mono text-sm uppercase tracking-wide">Core Team</h3>
              </div>
              <div className="font-mono text-4xl font-bold">{totalAdmins}</div>
              <p className="text-sm text-foreground/70">Owners & admins with full control</p>
            </div>

            <div className="card-brutalist p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <PhotoIcon className="w-6 h-6" />
                <h3 className="font-mono text-sm uppercase tracking-wide">Wallpapers Live</h3>
              </div>
              <div className="font-mono text-4xl font-bold">{totalWallpapers}</div>
              <p className="text-sm text-foreground/70">{pendingWallpapers} awaiting review</p>
            </div>

            <div className="card-brutalist p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <BoltIcon className="w-6 h-6" />
                <h3 className="font-mono text-sm uppercase tracking-wide">Moderators</h3>
              </div>
              <div className="font-mono text-4xl font-bold">{totalModerators}</div>
              <p className="text-sm text-foreground/70">Curtating uploads & keeping the feed clean</p>
            </div>
          </div>
        </FadeInUp>

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StaggerItem className="lg:col-span-2">
            <FadeInUp delay={0.15}>
              <div className="card-brutalist p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheckIcon className="w-6 h-6" />
                  <h2 className="text-lg font-bold font-mono uppercase tracking-wide">People & Roles</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="uppercase tracking-wide text-xs text-foreground/60">
                        <th className="py-3 pr-6">Name</th>
                        <th className="py-3 pr-6">Email</th>
                        <th className="py-3 pr-6">Role</th>
                        <th className="py-3 pr-6">Status</th>
                        <th className="py-3 pr-6">Uploads</th>
                        <th className="py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/15">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="py-3 pr-6 font-medium">{user.name}</td>
                          <td className="py-3 pr-6 text-foreground/70">{user.email}</td>
                          <td className="py-3 pr-6">
                            <select
                              value={user.role}
                              onChange={(event) => updateUserRole(user.id, event.target.value as Role)}
                              className="px-3 py-2 border-2 border-foreground bg-background text-sm font-mono uppercase tracking-wide"
                            >
                              <option value="Owner">Owner</option>
                              <option value="Admin">Admin</option>
                              <option value="Moderator">Moderator</option>
                              <option value="Support">Support</option>
                            </select>
                          </td>
                          <td className="py-3 pr-6">
                            <span
                              className={cn(
                                'inline-flex items-center px-3 py-1 border-2 border-foreground text-xs font-mono uppercase tracking-widest',
                                user.status === 'Active' ? 'bg-primary text-background' : 'bg-yellow-500/20'
                              )}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 pr-6 font-mono">{user.wallpapersUploaded}</td>
                          <td className="py-3 text-xs text-foreground/60">Last active {user.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeInUp>
          </StaggerItem>

          <StaggerItem>
            <FadeInUp delay={0.2}>
              <div className="card-brutalist p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <UserPlusIcon className="w-6 h-6" />
                  <h2 className="text-lg font-bold font-mono uppercase tracking-wide">Invite New Staff</h2>
                </div>

                <form onSubmit={createInvite} className="space-y-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase tracking-wide text-foreground/60">Email</span>
                    <input
                      type="email"
                      value={newInvite.email}
                      onChange={(event) => setNewInvite((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="you@voidwallz.com"
                      className="px-4 py-3 border-2 border-foreground bg-background focus:outline-none focus:bg-primary focus:text-background font-mono"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase tracking-wide text-foreground/60">Role</span>
                    <select
                      value={newInvite.role}
                      onChange={(event) => setNewInvite((prev) => ({ ...prev, role: event.target.value as Role }))}
                      className="px-4 py-3 border-2 border-foreground bg-background font-mono uppercase tracking-wide"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Support">Support</option>
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="w-full btn-brutalist px-4 py-3 font-mono font-bold uppercase tracking-wide"
                  >
                    Send Invite
                  </button>
                </form>

                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-foreground/60">Recent Invites</h3>
                  {invites.length === 0 ? (
                    <p className="text-sm text-foreground/60">No pending invitations.</p>
                  ) : (
                    <ul className="space-y-3">
                      {invites.map((invite) => (
                        <li
                          key={invite.id}
                          className="flex items-center justify-between gap-3 border-2 border-foreground px-3 py-2 text-xs font-mono"
                        >
                          <div>
                            <div className="uppercase tracking-wide">{invite.email}</div>
                            <div className="text-foreground/60">
                              {invite.role} • {invite.sent} • {invite.status}
                            </div>
                          </div>
                          <button
                            onClick={() => revokeInvite(invite.id)}
                            className="px-3 py-1 border-2 border-foreground hover:bg-secondary hover:text-background transition"
                          >
                            Revoke
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </FadeInUp>
          </StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StaggerItem className="lg:col-span-2">
            <FadeInUp delay={0.25}>
              <div className="card-brutalist p-6">
                <div className="flex flex-col gap-6 mb-6 md:flex-row md:items-end md:justify-between">
                  <div className="flex items-center gap-3">
                    <PhotoIcon className="w-6 h-6" />
                    <h2 className="text-lg font-bold font-mono uppercase tracking-wide">Wallpaper Pipeline</h2>
                  </div>

                  <form onSubmit={createWallpaper} className="grid grid-cols-1 gap-3 md:grid-cols-6 md:items-end">
                    <label className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-xs font-mono uppercase tracking-wide text-foreground/60">Title</span>
                      <input
                        value={newWallpaper.title}
                        onChange={(event) => setNewWallpaper((prev) => ({ ...prev, title: event.target.value }))}
                        placeholder="Enter wallpaper title"
                        className="px-4 py-2 border-2 border-foreground bg-background focus:outline-none focus:bg-primary focus:text-background font-mono text-sm"
                      />
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-1">
                      <span className="text-xs font-mono uppercase tracking-wide text-foreground/60">Category</span>
                      <select
                        value={newWallpaper.category}
                        onChange={(event) => setNewWallpaper((prev) => ({ ...prev, category: event.target.value }))}
                        className="px-4 py-2 border-2 border-foreground bg-background font-mono uppercase tracking-wide text-sm"
                      >
                        {['Minimalist', 'Abstract', 'Gaming', 'Nature', 'Futuristic', 'Cars', 'Space'].map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-1">
                      <span className="text-xs font-mono uppercase tracking-wide text-foreground/60">Status</span>
                      <select
                        value={newWallpaper.status}
                        onChange={(event) => setNewWallpaper((prev) => ({ ...prev, status: event.target.value as WallpaperStatus }))}
                        className="px-4 py-2 border-2 border-foreground bg-background font-mono uppercase tracking-wide text-sm"
                      >
                        {['Draft', 'Pending Review', 'Published'].map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-xs font-mono uppercase tracking-wide text-foreground/60">Curator</span>
                      <input
                        value={newWallpaper.curator}
                        onChange={(event) => setNewWallpaper((prev) => ({ ...prev, curator: event.target.value }))}
                        placeholder="Curator name"
                        className="px-4 py-2 border-2 border-foreground bg-background focus:outline-none focus:bg-primary focus:text-background font-mono text-sm"
                      />
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-1">
                      <span className="text-xs font-mono uppercase tracking-wide text-foreground/60">Device</span>
                      <select
                        value={newWallpaper.deviceType}
                        onChange={(event) => setNewWallpaper((prev) => ({ ...prev, deviceType: event.target.value as DeviceType }))}
                        className="px-4 py-2 border-2 border-foreground bg-background font-mono uppercase tracking-wide text-sm"
                      >
                        <option value="desktop">Desktop</option>
                        <option value="mobile">Mobile</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-3">
                      <span className="text-xs font-mono uppercase tracking-wide text-foreground/60">Artwork (PNG/JPG/WEBP)</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleWallpaperFile}
                        className="px-4 py-2 border-2 border-dashed border-foreground bg-background font-mono text-xs uppercase tracking-wide cursor-pointer"
                      />
                    </label>
                    {newWallpaper.previewUrl && (
                      <div className="md:col-span-6 border-2 border-foreground p-3 flex items-center gap-3 bg-card/40">
                        {newWallpaper.previewUrl.startsWith('blob:') ? (
                          <img
                            src={newWallpaper.previewUrl}
                            alt="New wallpaper preview"
                            className="w-24 h-16 object-cover border border-foreground"
                          />
                        ) : (
                          <Image
                            src={newWallpaper.previewUrl}
                            alt="New wallpaper preview"
                            width={96}
                            height={64}
                            unoptimized
                            className="w-24 h-16 object-cover border border-foreground"
                          />
                        )}
                        {newWallpaper.previewUrl.startsWith('blob:') && (
                          <div className="text-xs font-mono uppercase tracking-wide text-foreground/70">
                            Preview uses a local object URL. Connect file uploads to storage to persist assets.
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="btn-brutalist px-4 py-3 font-mono font-bold uppercase tracking-wide md:col-span-6"
                      disabled={!newWallpaper.title.trim() || !newWallpaper.curator.trim() || !newWallpaper.file}
                    >
                      Add Wallpaper
                    </button>
                  </form>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="uppercase tracking-wide text-xs text-foreground/60">
                        <th className="py-3 pr-6">Title</th>
                        <th className="py-3 pr-6">Category</th>
                        <th className="py-3 pr-6">Status</th>
                        <th className="py-3 pr-6">Curator</th>
                        <th className="py-3 pr-6">Preview</th>
                        <th className="py-3">Last edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/15">
                      {wallpapers.map((wallpaper) => (
                        <tr key={wallpaper.id}>
                          <td className="py-3 pr-6 font-medium">{wallpaper.title}</td>
                          <td className="py-3 pr-6 text-foreground/70">{wallpaper.category}</td>
                          <td className="py-3 pr-6">
                            <button
                              onClick={() => toggleWallpaperStatus(wallpaper.id)}
                              className={cn(
                                'px-3 py-1 border-2 border-foreground text-xs font-mono uppercase tracking-wide',
                                wallpaper.status === 'Published'
                                  ? 'bg-primary text-background'
                                  : 'bg-yellow-500/20 hover:bg-yellow-500/30'
                              )}
                            >
                              {wallpaper.status}
                            </button>
                          </td>
                          <td className="py-3 pr-6 text-sm">{wallpaper.curator}</td>
                          <td className="py-3 pr-6">
                            {wallpaper.previewUrl ? (
                              <Image
                                src={wallpaper.previewUrl}
                                alt={`${wallpaper.title} preview`}
                                width={80}
                                height={64}
                                unoptimized
                                className="w-20 h-16 object-cover border border-foreground"
                              />
                            ) : (
                              <span className="text-xs font-mono uppercase tracking-wide text-foreground/50">No preview</span>
                            )}
                          </td>
                          <td className="py-3 text-sm text-foreground/60">{wallpaper.lastEdit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeInUp>
          </StaggerItem>

          <StaggerItem>
            <FadeInUp delay={0.3}>
              <div className="card-brutalist p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <InboxArrowDownIcon className="w-6 h-6" />
                  <h2 className="text-lg font-bold font-mono uppercase tracking-wide">Audit Trail</h2>
                </div>
                <ul className="space-y-3 text-xs font-mono">
                  {auditLog.map((entry, index) => (
                    <li key={index} className="border-2 border-foreground px-3 py-2 bg-card/60">
                      {entry}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    setAuditLog((prev) => [
                      `2025-09-27 18:50 • Manual log created by Owner`,
                      ...prev
                    ])
                  }
                  className="btn-brutalist w-full px-3 py-2 text-sm font-mono uppercase tracking-wide"
                >
                  Add Log Entry
                </button>
              </div>
            </FadeInUp>
          </StaggerItem>
        </StaggerContainer>

        <FadeInUp delay={0.35}>
          <div className="card-brutalist p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <h2 className="text-lg font-bold font-mono uppercase tracking-wide">Security Checklist</h2>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                Enable SSO or JWT-based admin authentication.
              </li>
              <li className="flex items-center gap-3">
                <LockClosedIcon className="w-5 h-5 text-green-500" />
                Restrict admin routes via server-side middleware (Next.js Route Handlers or Middleware).
              </li>
              <li className="flex items-center gap-3">
                <ArrowPathIcon className="w-5 h-5 text-green-500" />
                Connect Prisma actions for user, wallpaper, and role mutations.
              </li>
              <li className="flex items-center gap-3 text-foreground/70">
                <ClockIcon className="w-5 h-5" />
                Schedule automated backups & weekly activity reports.
              </li>
            </ul>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
