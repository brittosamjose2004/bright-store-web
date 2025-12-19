"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, History, AlertCircle, CheckCircle } from 'lucide-react';

interface Message {
    id: string;
    subject: string;
    body: string;
    sent_via: string[];
    recipient_count: number;
    created_at: string;
}

export default function BroadcastPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setMessages(data);
        setHistoryLoading(false);
    };

    const handleSend = async () => {
        if (!subject || !body) return alert('Please fill in all fields');
        if (!confirm('This will notify ALL users. Are you sure?')) return;

        setLoading(true);
        try {
            // Get session for Auth token
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch('/api/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({ subject, body }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send');

            alert(`Broadcast Sent! Reach: ${data.recipientCount} users.`);
            setSubject('');
            setBody('');
            fetchHistory();
        } catch (error: any) {
            console.error(error);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-yellow-500 mb-8">Broadcast Messaging</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Send Form */}
                <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 h-fit">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Send size={24} className="text-yellow-500" />
                        New Broadcast
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">Subject / Title</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Daily Price Update: Chicken ₹180/kg"
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">Message Body</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={6}
                                placeholder="Detailed message here..."
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500"
                            />
                        </div>

                        <div className="bg-neutral-800/50 p-4 rounded-lg flex items-start gap-3">
                            <AlertCircle size={20} className="text-yellow-500 mt-1" />
                            <div className="text-sm text-neutral-400">
                                This will send an <strong>Email</strong> to all registered users AND a <strong>Push Notification</strong> to all installed mobile apps.
                            </div>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${loading ? 'bg-neutral-700 text-neutral-500' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
                        >
                            {loading ? <span className="animate-spin">⏳</span> : <Send size={20} />}
                            {loading ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </div>
                </div>

                {/* History */}
                <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <History size={24} className="text-neutral-400" />
                        Recent History
                    </h2>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {messageList(messages, historyLoading)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function messageList(messages: Message[], loading: boolean) {
    if (loading) return <div className="text-neutral-500 text-center">Loading...</div>;
    if (messages.length === 0) return <div className="text-neutral-500 text-center">No broadcasts yet.</div>;

    return messages.map((msg) => (
        <div key={msg.id} className="bg-neutral-800 p-4 rounded-xl border border-neutral-700/50">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white">{msg.subject}</h3>
                <span className="text-xs text-neutral-500">{new Date(msg.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-neutral-400 mb-3">{msg.body}</p>
            <div className="flex items-center gap-4 text-xs text-neutral-500 border-t border-neutral-700 pt-3">
                <span className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-500" />
                    Sent to {msg.recipient_count} users
                </span>
                <span>Via: {msg.sent_via.join(', ')}</span>
            </div>
        </div>
    ));
}
