'use client';
import { useState, useEffect } from 'react';
import { useCalendarStore } from '@/store/calendar';
import { useAiChatStore } from '@/store/ai-chat';
import { useHealthStore } from '@/store/health';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ConnectCalendar from '@/components/ConnectCalendar';
import HealthConnect from '@/components/HealthConnect';
import HealthSync from '@/components/HealthSync';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';

type TabType = 'overview' | 'assistant';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { data, loading: dataLoading, error: dataError, fetchData } = useCalendarStore();
  const { 
    messages, 
    loading: chatLoading, 
    error: chatError, 
    setUserContext, 
    generateProactiveMessage,
    isChatMode,
    setIsChatMode
  } = useAiChatStore();
  const { 
    heartRate, 
    sleepHours, 
    stressLevel, 
    loadData: loadHealthData 
  } = useHealthStore();

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update context when data changes
  useEffect(() => {
    if (data) {
      setUserContext({
        workPatterns: {
          meetings: data.meetings,
          breaks: data.breaks,
          afterHoursWork: data.afterHoursWork,
        },
        userId: data.userId,   
      });
      loadHealthData(data.userId);
    }
  }, [data, setUserContext, loadHealthData]);

  // Generate proactive message when switching to assistant tab
  useEffect(() => {
    if (activeTab === 'assistant' && data?.userId && messages.length === 0) {
      generateProactiveMessage(data.userId);
    }
  }, [activeTab, data, messages.length, generateProactiveMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <Header />
      <HealthSync />
      
      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-200 sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`relative py-4 px-6 rounded-t-2xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <span>Dashboard</span>
              </span>
              {activeTab === 'overview' && (
                <div className="absolute -bottom-px left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`relative py-4 px-6 rounded-t-2xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'assistant'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <span>AI Coach</span>
              </span>
              {activeTab === 'assistant' && (
                <div className="absolute -bottom-px left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              )}
            </button>
          </nav>
        </div>
      </div>

      <main className="container mx-auto p-6">
        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Welcome to Your Wellness Hub! 🌟
              </h1>
              <p className="text-gray-600 text-lg">
                Let's keep your work-life balance healthy and happy
              </p>
            </div>

            {dataLoading && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl"></div>
                  </div>
                ))}
              </div>
            )}

            {dataError && (
              <Card className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">😅</span>
                  <p className="text-red-600 font-medium mb-4">Oops! Something went wrong</p>
                  <Button onClick={fetchData} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    Try Again 🔄
                  </Button>
                </div>
              </Card>
            )}

            {data && (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6 bg-gradient-to-br from-blue-400 to-blue-600 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-blue-100">Today's Meetings</h3>
                      <span className="text-3xl">📅</span>
                    </div>
                    <p className="text-3xl font-bold mb-2">{data.meetings}</p>
                    <p className="text-blue-100 text-sm">
                      {data.meetings > 6 ? '😰 Quite busy today!' : '😊 Looking good!'}
                    </p>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-br from-green-400 to-green-600 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-green-100">Break Time</h3>
                      <span className="text-3xl">☕</span>
                    </div>
                    <p className="text-3xl font-bold mb-2">{data.breaks} min</p>
                    <p className="text-green-100 text-sm">
                      {data.breaks < 30 ? '⏰ Time for more breaks!' : '🎉 Great balance!'}
                    </p>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-br from-orange-400 to-red-500 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-orange-100">Overtime Hours</h3>
                      <span className="text-3xl">🌙</span>
                    </div>
                    <p className="text-3xl font-bold mb-2">{data.afterHoursWork}h</p>
                    <p className="text-orange-100 text-sm">
                      {data.afterHoursWork > 2 ? '😴 Time to rest!' : '✨ Healthy boundaries!'}
                    </p>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-br from-pink-400 to-red-500 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-pink-100">Health Metrics</h3>
                      <span className="text-3xl">❤️</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">Heart Rate: {heartRate} BPM</p>
                      <p className="text-sm">Sleep: {sleepHours} hours</p>
                      <p className="text-sm">Stress Level: {stressLevel}/10</p>
                    </div>
                  </Card>
                  {/* ... existing health metric cards ... */}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <HealthConnect />
                  <ConnectCalendar />
                  <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <span className="text-3xl">🎯</span>
                      Quick Actions
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Button 
                        onClick={() => setActiveTab('assistant')}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-6 rounded-2xl transform hover:scale-105 transition-all duration-300"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-xl">💬</span>
                          <span>Chat with Alex</span>
                        </span>
                      </Button>
                      {/* Other buttons... */}
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* AI Assistant Tab Content */}
        {activeTab === 'assistant' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                  🤖
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Meet Alex, Your AI Coach! ✨
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Your personal wellness companion, here to help you thrive
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('overview')}
                className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full px-6 py-2 font-medium"
              >
                ← Back to Dashboard
              </Button>
            </div>

            <Card className="p-8 bg-gradient-to-br from-white to-indigo-50 border-indigo-200 shadow-xl">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="text-3xl">💭</span>
                    Chat with Alex
                  </h3>
                  {messages.length > 0 && (
                    <Button
                      onClick={() => useAiChatStore.getState().clearMessages()}
                      variant="outline"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear Chat
                    </Button>
                  )}
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-6 space-y-4 max-h-96 overflow-y-auto border border-purple-200">
                  {chatLoading && (
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse">
                        🤖
                      </div>
                      <div className="flex-1">
                        <div className="animate-pulse flex gap-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <p className="text-sm text-purple-600 mt-2">Alex is thinking...</p>
                      </div>
                    </div>
                  )}
                  
                  {chatError && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">😅</span>
                        <div>
                          <p className="text-red-600 font-medium">Oops! Something went wrong</p>
                          <p className="text-red-500 text-sm mt-1">{chatError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {messages.length === 0 && !chatLoading && (
                    <div className="text-center py-8">
                      <span className="text-6xl mb-4 block">🌸</span>
                      <p className="text-gray-600">Alex is ready to help you with personalized wellness insights!</p>
                    </div>
                  )}
                  
                  {messages.map((msg, i) => (
                    <ChatMessage 
                      key={i}
                      role={msg.role}
                      content={msg.content}
                      timestamp={msg.timestamp}
                    />
                  ))}
                </div>

                {isChatMode ? (
                  <ChatInput disabled={chatLoading} />
                ) : (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => data?.userId && generateProactiveMessage(data.userId)}
                      disabled={chatLoading}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🔮</span>
                        <span>Get Fresh Insights</span>
                      </span>
                    </Button>
                    <Button 
                      onClick={() => setIsChatMode(true)}
                      variant="outline" 
                      className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-medium py-3 px-6 rounded-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">💬</span>
                        <span>Start Chat</span>
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
