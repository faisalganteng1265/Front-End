'use client';

import { useState, useEffect, useRef } from 'react';
import { Atom } from 'react-loading-indicators';
import StaggeredMenu from './StaggeredMenu';
import Particles from './Particles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

// ====================================
// TypeScript Interfaces
// ====================================

interface Peer {
  id: string; // UUID from auth.users
  name: string; // From profiles.username
  avatar: string | null; // From profiles.avatar_url
  interests: string[]; // Parsed from user_data.minat
  online: boolean;
}

interface Message {
  id: string; // UUID from group_messages
  senderId: string; // UUID
  senderName: string;
  senderAvatar: string | null;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

interface GroupChat {
  id: string; // From interest_groups.id
  name: string;
  interest: string; // interest_category
  icon: string;
  description: string;
  memberCount: number;
  members: Peer[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  messages: Message[];
}

// ====================================
// Interest Options with Icons
// ====================================

const interestOptions = [
  { value: 'teknologi', label: 'Teknologi & IT', icon: '/ICONKOMPUTER.png' },
  { value: 'bisnis', label: 'Bisnis & Entrepreneurship', icon: '/ICONBISNIS.png' },
  { value: 'seni', label: 'Seni & Kreatif', icon: '/SENIICON.png' },
  { value: 'sosial', label: 'Sosial & Volunteering', icon: '/SOSIALICON.png' },
  { value: 'akademik', label: 'Akademik & Penelitian', icon: '/AKADEMIKICON.png' },
  { value: 'olahraga', label: 'Olahraga & Kesehatan', icon: '/OLAHRAGAICON.png' },
  { value: 'leadership', label: 'Leadership & Organisasi', icon: '/ORGANISASIICON.png' },
  { value: 'lingkungan', label: 'Lingkungan & Sustainability', icon: '/LINGKUNGANICON.png' },
];

// ====================================
// Helper Functions
// ====================================

const parseInterests = (minatText: string): string[] => {
  const minat = minatText.toLowerCase().trim();
  const detectedInterests: string[] = [];

  const interestKeywords: { [key: string]: string[] } = {
    teknologi: ['teknologi', 'it', 'programming', 'coding', 'software', 'web', 'ai', 'machine learning', 'data', 'komputer', 'developer'],
    bisnis: ['bisnis', 'business', 'entrepreneur', 'startup', 'marketing', 'manajemen', 'wirausaha'],
    seni: ['seni', 'art', 'design', 'creative', 'kreatif', 'musik', 'film', 'fotografi', 'gambar'],
    sosial: ['sosial', 'social', 'volunteer', 'komunitas', 'charity', 'kemanusiaan'],
    akademik: ['akademik', 'research', 'penelitian', 'science', 'sains', 'study', 'belajar', 'ilmu'],
    olahraga: ['olahraga', 'sport', 'fitness', 'kesehatan', 'health', 'futsal', 'basket', 'lari'],
    leadership: ['leadership', 'leader', 'organisasi', 'organization', 'management', 'pemimpin', 'ketua'],
    lingkungan: ['lingkungan', 'environment', 'sustainability', 'eco', 'green', 'alam'],
  };

  Object.entries(interestKeywords).forEach(([interestValue, keywords]) => {
    if (keywords.some(keyword => minat.includes(keyword))) {
      detectedInterests.push(interestValue);
    }
  });

  return detectedInterests.length > 0 ? detectedInterests : ['teknologi', 'akademik'];
};

const getInterestIcon = (interestCategory: string): string => {
  const iconMap: { [key: string]: string } = {
    teknologi: '/ICONKOMPUTER.png',
    bisnis: '/ICONBISNIS.png',
    seni: '/SENIICON.png',
    sosial: '/SOSIALICON.png',
    akademik: '/AKADEMIKICON.png',
    olahraga: '/OLAHRAGAICON.png',
    leadership: '/ORGANISASIICON.png',
    lingkungan: '/LINGKUNGANICON.png',
  };

  return iconMap[interestCategory] || '/ICONKOMPUTER.png';
};

// ====================================
// Main Component
// ====================================

export default function PeerConnect() {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const [chatMode, setChatMode] = useState<'group' | 'private'>('group');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [privateChatHistory, setPrivateChatHistory] = useState<{[key: string]: Message[]}>({});
  const [activePrivateChats, setActivePrivateChats] = useState<Peer[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('Memuat data autentikasi...');
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ====================================
  // Database Functions
  // ====================================

  // Fetch groups where user is a member
  const fetchUserGroups = async (userId: string): Promise<GroupChat[]> => {
    try {
      // Get groups where user is a member
      const { data: membershipData, error: membershipError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          interest_groups (
            id,
            name,
            interest_category,
            description,
            avatar_url
          )
        `)
        .eq('user_id', userId);

      if (membershipError) throw membershipError;

      if (!membershipData || membershipData.length === 0) {
        console.log('PeerConnect: User has no groups');
        return [];
      }

      // For each group, fetch members and messages
      const groupsWithData = await Promise.all(
        membershipData.map(async (membership: any) => {
          const group = membership.interest_groups;
          if (!group) return null;

          // Fetch member count
          const { count: memberCount } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          // Fetch members
          const members = await fetchGroupMembers(group.id);

          // Fetch messages
          const groupMessages = await fetchGroupMessages(group.id, 50);

          // Get last message
          const lastMsg = groupMessages[groupMessages.length - 1];

          return {
            id: group.id,
            name: group.name,
            interest: group.interest_category,
            icon: getInterestIcon(group.interest_category),
            description: group.description || '',
            memberCount: memberCount || 0,
            members,
            lastMessage: lastMsg?.text,
            lastMessageTime: lastMsg?.timestamp,
            unreadCount: 0,
            messages: groupMessages,
          } as GroupChat;
        })
      );

      return groupsWithData.filter(g => g !== null) as GroupChat[];
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return [];
    }
  };

  // Fetch members of a group
  const fetchGroupMembers = async (groupId: string): Promise<Peer[]> => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          user_id,
          profiles!inner (
            id,
            username,
            avatar_url,
            email
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      if (!data) return [];

      // Also fetch user_data for interests
      const userIds = data.map((m: any) => m.user_id);
      const { data: userData, error: userDataError } = await supabase
        .from('user_data')
        .select('user_id, minat')
        .in('user_id', userIds);

      const userDataMap = new Map(
        (userData || []).map((ud: any) => [ud.user_id, ud.minat || ''])
      );

      const peers: Peer[] = data.map((member: any) => ({
        id: member.profiles.id,
        name: member.profiles.username || member.profiles.email?.split('@')[0] || 'Anonymous',
        avatar: member.profiles.avatar_url,
        interests: parseInterests(userDataMap.get(member.user_id) || ''),
        online: true,
      }));

      return peers;
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  };

  // Fetch messages from a group
  const fetchGroupMessages = async (groupId: string, limit = 50): Promise<Message[]> => {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!inner (
            username,
            avatar_url,
            email
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      if (!data) return [];

      const messages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        senderId: msg.user_id,
        senderName: msg.profiles.username || msg.profiles.email?.split('@')[0] || 'Anonymous',
        senderAvatar: msg.profiles.avatar_url,
        text: msg.content,
        timestamp: new Date(msg.created_at),
        isMe: msg.user_id === user?.id,
      }));

      return messages;
    } catch (error) {
      console.error('Error fetching group messages:', error);
      return [];
    }
  };

  // Send message to group
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedGroup || !user) return;

    try {
      setIsSending(true);

      // Insert message to database
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: selectedGroup.id,
          user_id: user.id,
          content: inputMessage.trim(),
        })
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .single();

      if (error) throw error;

      // Get current user's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url, email')
        .eq('id', user.id)
        .single();

      // Add to local messages
      const newMessage: Message = {
        id: data.id,
        senderId: data.user_id,
        senderName: profileData?.username || profileData?.email?.split('@')[0] || 'You',
        senderAvatar: profileData?.avatar_url || null,
        text: data.content,
        timestamp: new Date(data.created_at),
        isMe: true,
      };

      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');

      // Update group's last message
      setGroups(prevGroups =>
        prevGroups.map(g =>
          g.id === selectedGroup.id
            ? { ...g, lastMessage: newMessage.text, lastMessageTime: newMessage.timestamp }
            : g
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // ====================================
  // Realtime Subscription
  // ====================================

  useEffect(() => {
    if (!selectedGroup || !user) return;

    // Subscribe to new messages in current group
    const channel = supabase
      .channel(`group-${selectedGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${selectedGroup.id}`,
        },
        async (payload) => {
          console.log('New message received:', payload);

          // Fetch full message data with user profile
          const { data, error } = await supabase
            .from('group_messages')
            .select(`
              id,
              content,
              created_at,
              user_id,
              profiles!inner (
                username,
                avatar_url,
                email
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            const newMessage: Message = {
              id: data.id,
              senderId: data.user_id,
              senderName: data.profiles.username || data.profiles.email?.split('@')[0] || 'Anonymous',
              senderAvatar: data.profiles.avatar_url,
              text: data.content,
              timestamp: new Date(data.created_at),
              isMe: data.user_id === user.id,
            };

            // Only add if not from current user (already added optimistically)
            if (!newMessage.isMe) {
              setMessages(prev => [...prev, newMessage]);

              // Update group's last message
              setGroups(prevGroups =>
                prevGroups.map(g =>
                  g.id === selectedGroup.id
                    ? { ...g, lastMessage: newMessage.text, lastMessageTime: newMessage.timestamp }
                    : g
                )
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroup, user]);

  // ====================================
  // Initialize: Fetch User Data & Groups
  // ====================================

  useEffect(() => {
    if (loading) {
      setLoadingMessage('Memuat data autentikasi...');
      return;
    }

    if (hasInitialized) return;

    const initializePeerConnect = async () => {
      setHasInitialized(true);

      if (!user) {
        setLoadingMessage('Kamu belum login. Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      try {
        setLoadingMessage('Memuat data minat dari profil kamu...');

        // Fetch user's minat
        const { data: userData, error: userDataError } = await supabase
          .from('user_data')
          .select('minat')
          .eq('user_id', user.id)
          .single();

        if (userDataError) {
          if (userDataError.code === 'PGRST116') {
            setLoadingMessage('Profil belum lengkap. Redirecting...');
            setTimeout(() => {
              alert('Silakan lengkapi profil kamu terlebih dahulu (khususnya minat) untuk menggunakan Peer Connect!');
              window.location.href = '/';
            }, 2000);
            return;
          }
          throw userDataError;
        }

        if (!userData || !userData.minat || userData.minat.trim() === '') {
          setLoadingMessage('Minat belum diisi. Redirecting...');
          setTimeout(() => {
            alert('Silakan isi minat kamu di profil untuk menggunakan Peer Connect!');
            window.location.href = '/';
          }, 2000);
          return;
        }

        setLoadingMessage('Memeriksa grup yang kamu ikuti...');

        // Auto-join user to groups based on interests
        await supabase.rpc('auto_join_interest_groups', {
          p_user_id: user.id,
          p_minat: userData.minat,
        });

        setLoadingMessage('Memuat grup dan pesan...');

        // Fetch user's groups
        const userGroups = await fetchUserGroups(user.id);

        if (userGroups.length === 0) {
          setLoadingMessage('Tidak ada grup ditemukan. Redirecting...');
          setTimeout(() => {
            alert('Tidak ada grup yang sesuai dengan minat kamu. Silakan update minat di profil.');
            window.location.href = '/';
          }, 2000);
          return;
        }

        setGroups(userGroups);

        // Auto-select first group
        if (userGroups.length > 0) {
          handleGroupSelect(userGroups[0]);
        }

        setIsLoading(false);
        setShowChat(true);
      } catch (error: any) {
        console.error('PeerConnect: Error initializing:', error);
        setLoadingMessage('Terjadi kesalahan. Redirecting...');
        setTimeout(() => {
          alert(`Terjadi kesalahan: ${error.message}. Silakan coba lagi.`);
          window.location.href = '/';
        }, 2000);
      }
    };

    initializePeerConnect();
  }, [user, loading, hasInitialized]);

  // ====================================
  // Event Handlers
  // ====================================

  const handleGroupSelect = (group: GroupChat) => {
    setSelectedGroup(group);
    setChatMode('group');
    setSelectedPeer(null);
    setMessages(group.messages);
  };

  const handlePeerSelect = (peer: Peer) => {
    setSelectedPeer(peer);
    setChatMode('private');
    setSelectedGroup(null);

    // Load private chat history (if any)
    if (privateChatHistory[peer.id]) {
      setMessages(privateChatHistory[peer.id]);
    } else {
      setMessages([]);
    }

    // Add to active private chats if not already there
    if (!activePrivateChats.some(p => p.id === peer.id)) {
      setActivePrivateChats(prev => [...prev, peer]);
    }
  };

  const handleSendPrivateMessage = async () => {
    if (!inputMessage.trim() || !selectedPeer || !user) return;

    // Note: Private messaging would need a separate table
    // For now, we'll just show a message
    alert('Private messaging feature coming soon!');
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatMode === 'group') {
        handleSendMessage();
      } else {
        handleSendPrivateMessage();
      }
    }
  };

  // ====================================
  // Render: Loading State
  // ====================================

  if (isLoading) {
    return (
      <div className="relative h-screen bg-black overflow-hidden flex items-center justify-center">
        <Particles />
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <Atom color="#84cc16" size="medium" text="" textColor="#84cc16" />
          </div>
          <p
            className="text-white text-2xl font-semibold"
            style={{
              textShadow: '0 0 20px rgba(132, 204, 22, 0.9), 0 0 40px rgba(132, 204, 22, 0.6)'
            }}
          >
            {loadingMessage}
          </p>
        </div>
      </div>
    );
  }

  // ====================================
  // Render: Chat Interface
  // ====================================

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      <Particles />
      <StaggeredMenu />

      {showChat && (
        <div className="relative z-10 h-screen flex flex-col">
          {/* Top Header */}
          <div className="bg-gradient-to-r from-lime-500/10 to-green-500/10 backdrop-blur-md border-b border-lime-500/30 p-4">
            <h1 className="text-3xl font-bold text-white text-center">
              Peer Connect - Real Group Chat
            </h1>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Group & Private Chat List */}
            <div className="w-80 bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-md border-r border-lime-500/20 overflow-y-auto custom-scrollbar">
              {/* Group Chats Section */}
              <div className="p-4 border-b border-lime-500/20">
                <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="text-lime-400">●</span>
                  Group Chats ({groups.length})
                </h2>
                <div className="space-y-2">
                  {groups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => handleGroupSelect(group)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedGroup?.id === group.id
                          ? 'bg-lime-500/20 border border-lime-500/50'
                          : 'bg-gray-800/50 hover:bg-gray-800/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={group.icon}
                          alt={group.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{group.name}</p>
                          <p className="text-gray-400 text-xs truncate">
                            {group.memberCount} members
                          </p>
                        </div>
                      </div>
                      {group.lastMessage && (
                        <p className="text-gray-500 text-xs mt-2 truncate">{group.lastMessage}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Private Chats Section */}
              {activePrivateChats.length > 0 && (
                <div className="p-4">
                  <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-blue-400">●</span>
                    Private Chats ({activePrivateChats.length})
                  </h2>
                  <div className="space-y-2">
                    {activePrivateChats.map(peer => (
                      <button
                        key={peer.id}
                        onClick={() => handlePeerSelect(peer)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedPeer?.id === peer.id
                            ? 'bg-blue-500/20 border border-blue-500/50'
                            : 'bg-gray-800/50 hover:bg-gray-800/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {peer.avatar ? (
                            <Image
                              src={peer.avatar}
                              alt={peer.name}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {peer.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-white font-semibold">{peer.name}</p>
                            <div className="flex items-center gap-1">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  peer.online ? 'bg-green-400' : 'bg-gray-500'
                                }`}
                              ></span>
                              <p className="text-gray-400 text-xs">
                                {peer.online ? 'Online' : 'Offline'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              {(selectedGroup || selectedPeer) && (
                <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-md border-b border-lime-500/20 p-4">
                  {chatMode === 'group' && selectedGroup && (
                    <div className="flex items-center gap-4">
                      <Image
                        src={selectedGroup.icon}
                        alt={selectedGroup.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <h2 className="text-white font-bold text-xl">{selectedGroup.name}</h2>
                        <p className="text-gray-400 text-sm">
                          {selectedGroup.memberCount} members • {selectedGroup.description}
                        </p>
                      </div>
                    </div>
                  )}
                  {chatMode === 'private' && selectedPeer && (
                    <div className="flex items-center gap-4">
                      {selectedPeer.avatar ? (
                        <Image
                          src={selectedPeer.avatar}
                          alt={selectedPeer.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                          {selectedPeer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h2 className="text-white font-bold text-xl">{selectedPeer.name}</h2>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              selectedPeer.online ? 'bg-green-400' : 'bg-gray-500'
                            }`}
                          ></span>
                          {selectedPeer.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto bg-transparent p-6 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-gray-500 text-lg mb-2">No messages yet</p>
                      <p className="text-gray-600 text-sm">Be the first to send a message!</p>
                    </div>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!message.isMe && (
                        <div className="flex-shrink-0">
                          {message.senderAvatar ? (
                            <Image
                              src={message.senderAvatar}
                              alt={message.senderName}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-500 to-green-500 flex items-center justify-center text-white font-bold">
                              {message.senderName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`max-w-lg ${message.isMe ? 'items-end' : 'items-start'}`}>
                        {!message.isMe && (
                          <p className="text-lime-400 text-sm font-semibold mb-1">
                            {message.senderName}
                          </p>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            message.isMe
                              ? 'bg-gradient-to-r from-lime-500 to-green-500 text-white'
                              : 'bg-gray-800/70 text-white border border-gray-700/50'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {(selectedGroup || selectedPeer) && (
                <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-md border-t border-lime-500/20 p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        chatMode === 'group'
                          ? `Send a message to ${selectedGroup?.name}...`
                          : `Send a private message to ${selectedPeer?.name}...`
                      }
                      className="flex-1 bg-gray-800/50 text-white rounded-full px-6 py-3 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                      disabled={isSending}
                    />
                    <button
                      onClick={chatMode === 'group' ? handleSendMessage : handleSendPrivateMessage}
                      disabled={!inputMessage.trim() || isSending}
                      className="bg-gradient-to-r from-lime-500 to-green-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-lime-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Members List */}
            {selectedGroup && (
              <div className="w-64 bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-md border-l border-lime-500/20 overflow-y-auto custom-scrollbar">
                <div className="p-4">
                  <h2 className="text-white font-bold mb-4">
                    Members ({selectedGroup.memberCount})
                  </h2>
                  <div className="space-y-3">
                    {selectedGroup.members.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-all cursor-pointer"
                        onClick={() => handlePeerSelect(member)}
                      >
                        {member.avatar ? (
                          <Image
                            src={member.avatar}
                            alt={member.name}
                            width={36}
                            height={36}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lime-500 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{member.name}</p>
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                member.online ? 'bg-green-400' : 'bg-gray-500'
                              }`}
                            ></span>
                            <p className="text-gray-400 text-xs">
                              {member.online ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        /* Chrome, Safari, Edge */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(132, 204, 22, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(132, 204, 22, 0.5);
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(132, 204, 22, 0.3) rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
