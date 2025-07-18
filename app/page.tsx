"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trophy, Plus, History, TrendingUp, Crown, Medal, Star, Gift, Zap, Sparkles } from "lucide-react"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface User {
  id: string
  name: string
  totalPoints: number
  rank: number
}

interface ClaimHistory {
  id: string
  userId: string
  userName: string
  pointsAwarded: number
  timestamp: string
}

export default function LeaderboardApp() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [newUserName, setNewUserName] = useState("")
  const [claimHistory, setClaimHistory] = useState<ClaimHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastClaimedPoints, setLastClaimedPoints] = useState<number | null>(null)
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false)

  // Fetch users and history on component mount
  useEffect(() => {
    fetchUsers()
    fetchHistory()

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchUsers()
      fetchHistory()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`)
      const data = await response.json()
      const rankedUsers = data
      .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
      .map((user: any, index: number) => ({
        id: user._id,
        name: user.name,
        totalPoints: user.totalPoints,
        rank: index + 1,
      }))
      setUsers(rankedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("❌ Error", {
      description: "Failed to fetch users. Please try again.",
    })
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/claim/history`)
      const data = await response.json()
      const mappedData = data.map((item: any) => ({
      id: item._id,
      userId: item.userId._id,
      userName: item.userId.name,
      pointsAwarded: item.points,
      timestamp: item.claimedAt,
    }))
      setClaimHistory(mappedData.slice(0, 10))
    } catch (error) {
      console.error("Error fetching history:", error)
      toast.error("❌ Error", {
      description: "Failed to fetch history. Please try again.",
    })
    }
  }

  const handleClaimPoints = async () => {
    if (!selectedUserId) {
      toast("⚠️ No user selected", {
  description: "Please select a user before claiming points.",
})
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUserId }),
      })

      const data = await response.json()

      if (response.ok) {
        setLastClaimedPoints(data.points)
        setIsRewardDialogOpen(false)
        setSelectedUserId("")
        toast("🎉 Points claimed!", {
  description: `${data.user.name} received ${data.points} points!`,
})

        fetchUsers()
        fetchHistory()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error("❌ Error", {
  description: "Failed to claim points. Please try again.",
})
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUserName.trim()) {
      toast.error("Invalid name", {
  description: "Please enter a valid user name.",
})
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newUserName.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setNewUserName("")
        toast("🎊 User added!", {
  description: `${data.name} has been added to the leaderboard.`,
})
        fetchUsers()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast("❌ Error", {
  description: "Failed to add user. Please try again.",
})
    }
  }

  const getAvatarColor = (userId: string) => {
    const colors = [
      "bg-gradient-to-br from-pink-500 to-rose-500",
      "bg-gradient-to-br from-blue-500 to-cyan-500",
      "bg-gradient-to-br from-green-500 to-emerald-500",
      "bg-gradient-to-br from-purple-500 to-violet-500",
      "bg-gradient-to-br from-orange-500 to-amber-500",
      "bg-gradient-to-br from-red-500 to-pink-500",
      "bg-gradient-to-br from-indigo-500 to-blue-500",
      "bg-gradient-to-br from-teal-500 to-green-500",
    ]
    return colors[Number.parseInt(userId) % colors.length]
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const topThree = users.slice(0, 3)
  const remainingUsers = users.slice(3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-20 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Floating Stars */}
      <div className="absolute top-10 left-10 text-yellow-400 opacity-60 animate-bounce">
        <Sparkles className="h-8 w-8" />
      </div>
      <div className="absolute top-32 right-16 text-cyan-400 opacity-60 animate-pulse">
        <Star className="h-6 w-6" />
      </div>
      <div className="absolute bottom-32 left-16 text-pink-400 opacity-60 animate-bounce delay-1000">
        <Zap className="h-10 w-10" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6 pt-8">
            <div className="flex items-center justify-center gap-6">
              <div className="relative">
                <Trophy className="h-16 w-16 text-yellow-400 animate-bounce" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <div className="relative">
                <Crown className="h-20 w-20 text-amber-400 animate-pulse" />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-amber-400/30 rounded-full animate-ping"></div>
              </div>
              <div className="relative">
                <Trophy className="h-16 w-16 text-yellow-400 animate-bounce delay-500" />
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping delay-500"></div>
              </div>
            </div>
            <h1 className="text-7xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
              LEADERBOARD
            </h1>
            <p className="text-2xl text-cyan-300 font-bold tracking-wide">🚀 COMPETE • CLAIM • CONQUER 🚀</p>
          </div>

          {/* Top 3 Podium */}
          <div className="flex items-end justify-center gap-12 mb-12">
            {/* Rank 2 */}
            {topThree[1] && (
              <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
                <div className="relative mb-6">
                  <div
                    className={`w-24 h-24 ${getAvatarColor(topThree[1].id)} rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-gray-300 shadow-2xl`}
                  >
                    {getInitials(topThree[1].name)}
                  </div>
                  <div className="absolute -top-3 -right-3 bg-gray-400 rounded-full p-2 border-2 border-white">
                    <Medal className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="h-32 w-32 bg-gradient-to-t from-gray-600 via-gray-500 to-gray-400 rounded-t-3xl shadow-2xl flex flex-col items-center justify-center relative border-4 border-gray-300">
                  <div className="text-white font-black text-4xl">2</div>
                  <div className="absolute -top-12 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl px-4 py-2 shadow-xl border border-gray-600">
                    <p className="font-bold text-lg">{topThree[1].name}</p>
                    <p className="text-sm text-gray-300 flex items-center gap-1 justify-center">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      {topThree[1].totalPoints}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {topThree[0] && (
              <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
                <div className="relative mb-6">
                  <div
                    className={`w-32 h-32 ${getAvatarColor(topThree[0].id)} rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-yellow-400 shadow-2xl`}
                  >
                    {getInitials(topThree[0].name)}
                  </div>
                  <div className="absolute -top-4 -right-4 bg-yellow-500 rounded-full p-3 border-2 border-white animate-pulse">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="h-40 w-36 bg-gradient-to-t from-yellow-600 via-yellow-500 to-yellow-400 rounded-t-3xl shadow-2xl flex flex-col items-center justify-center relative border-4 border-yellow-300">
                  <div className="text-white font-black text-5xl">1</div>
                  <div className="absolute -top-16 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-2xl px-6 py-3 shadow-2xl border-2 border-yellow-400">
                    <p className="font-bold text-xl">{topThree[0].name}</p>
                    <p className="text-lg text-yellow-200 flex items-center gap-2 justify-center">
                      <Trophy className="h-5 w-5 text-yellow-300" />
                      {topThree[0].totalPoints}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {topThree[2] && (
              <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
                <div className="relative mb-6">
                  <div
                    className={`w-20 h-20 ${getAvatarColor(topThree[2].id)} rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-amber-600 shadow-2xl`}
                  >
                    {getInitials(topThree[2].name)}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-amber-600 rounded-full p-2 border-2 border-white">
                    <Medal className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="h-24 w-28 bg-gradient-to-t from-amber-800 via-amber-700 to-amber-600 rounded-t-3xl shadow-2xl flex flex-col items-center justify-center relative border-4 border-amber-500">
                  <div className="text-white font-black text-3xl">3</div>
                  <div className="absolute -top-10 bg-gradient-to-r from-amber-800 to-amber-900 text-white rounded-2xl px-3 py-2 shadow-xl border border-amber-600">
                    <p className="font-bold">{topThree[2].name}</p>
                    <p className="text-sm text-amber-300 flex items-center gap-1 justify-center">
                      <Trophy className="h-3 w-3 text-yellow-400" />
                      {topThree[2].totalPoints}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reward Button */}
          <div className="flex justify-center mb-8">
            <Dialog open={isRewardDialogOpen} onOpenChange={setIsRewardDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 text-white font-black text-2xl px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all border-4 border-pink-400">
                  <Gift className="h-8 w-8 mr-4 animate-bounce" />🎁 CLAIM REWARDS 🎁
                  <Sparkles className="h-8 w-8 ml-4 animate-pulse" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-purple-500 text-white">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                    <Gift className="h-8 w-8 text-pink-400" />
                    Select User for Reward
                  </DialogTitle>
                  <DialogDescription className="text-cyan-300 text-lg">
                    Choose a user to receive random points (1-10)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="border-2 border-purple-500 bg-slate-700 text-white text-lg py-3">
                      <SelectValue placeholder="🎯 Choose a lucky user..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id} className="text-white hover:bg-purple-600">
                          {user.name} ({user.totalPoints} points)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {lastClaimedPoints && (
                    <div className="text-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl border-2 border-green-400">
                      <p className="text-white font-bold text-xl">🎉 Last reward: +{lastClaimedPoints} points! 🎊</p>
                    </div>
                  )}

                  <Button
                    onClick={handleClaimPoints}
                    disabled={!selectedUserId || isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-xl py-4 rounded-xl shadow-xl"
                  >
                    {isLoading ? "🎯 Claiming..." : "🎲 Claim Random Points"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Remaining Users List */}
          {remainingUsers.length > 0 && (
            <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-4 border-cyan-500 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-t-lg">
                <CardTitle className="text-3xl font-black text-white flex items-center gap-3">
                  <TrendingUp className="h-8 w-8" />🏆 Other Competitors
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 p-4">
                  {remainingUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-6 p-4 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border-2 border-slate-600 hover:border-cyan-400 transition-all transform hover:scale-102 shadow-lg"
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 text-white font-black rounded-full text-xl border-2 border-slate-500">
                        {user.rank}
                      </div>
                      <div
                        className={`w-16 h-16 ${getAvatarColor(user.id)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl`}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-xl">{user.name}</p>
                        <p className="text-cyan-300 flex items-center gap-2 text-lg">
                          <Trophy className="h-5 w-5 text-yellow-400" />
                          {user.totalPoints} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add New User */}
            <Card className="bg-gradient-to-br from-emerald-800/90 to-green-900/90 backdrop-blur-xl border-4 border-emerald-500 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-t-lg">
                <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                  <Plus className="h-7 w-7" />➕ Add New Competitor
                </CardTitle>
                <CardDescription className="text-emerald-200 text-lg">Bring in fresh competition!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <Input
                  placeholder="Enter epic username (emojis welcome! 🎉)..."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                  className="border-2 border-emerald-400 bg-slate-700 text-white text-lg py-3 placeholder:text-gray-400"
                />
                <Button
                  onClick={handleAddUser}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xl py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all"
                >
                  <Plus className="h-6 w-6 mr-3" />✨ Add to Battle
                </Button>
              </CardContent>
            </Card>

            {/* Points History */}
            <Card className="bg-gradient-to-br from-orange-800/90 to-red-900/90 backdrop-blur-xl border-4 border-orange-500 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 rounded-t-lg">
                <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                  <History className="h-7 w-7" />📈 Battle History
                </CardTitle>
                <CardDescription className="text-orange-200 text-lg">Recent point conquests</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-80 overflow-y-auto">
                  {claimHistory.length === 0 ? (
                    <p className="text-center text-gray-400 py-12 text-xl">No battles yet... 🏴‍☠️</p>
                  ) : (
                    <div className="space-y-2 p-4">
                      {claimHistory.map((claim) => (
                        <div
                          key={claim.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border-2 border-slate-600 hover:border-orange-400 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 ${getAvatarColor(claim.userId)} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
                            >
                              {getInitials(claim.userName)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-lg">{claim.userName}</p>
                              <p className="text-gray-400 text-sm">{new Date(claim.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg px-4 py-2 shadow-lg">
                            +{claim.pointsAwarded} 🎯
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}