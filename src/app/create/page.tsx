'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown'

export default function ChatComponent() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState({
    twitter: '',
    instagram: ''
 });
 const [text, setText] = useState("");
   const [accessToken, setAccessToken] = useState("");
   const [result, setResult] = useState(null);

  const handleSend = async () => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    console.log(data)
    extractPosts(data.message)
  };

  function extractPosts(text: string) {
    const twitterMatch = text.match(/\[Twitter\]\s*([\s\S]*?)\s*(?=\[Instagram\]|$)/i);
    const instagramMatch = text.match(/\[Instagram\]\s*([\s\S]*)/i);

    setResponse({
      twitter: twitterMatch?.[1]?.trim() || '',
      instagram: instagramMatch?.[1]?.trim() || ''
    })
  }

  const handleConnect = () => {
    window.location.href = "/api/auth/twitter/login";
  };

  const handleTweet = async () => {
    const res = await fetch("/api/twitter/tweet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, accessToken }),
    });
    const data = await res.json();
    setResult(data);
  };


  return (
    <div>
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask me something..."
        />
        <button onClick={handleSend}>Send</button>

        <div className='flex gap-4 m-4'>
            <div className='w-1/2 p-2 bg-stone-50 border rounded-xl'>
                <p className='mb-2 font-bold'>Twitter Post text:</p>
                <ReactMarkdown>{response.twitter}</ReactMarkdown>
            </div>

            <div className='w-1/2 p-2 bg-stone-50 border rounded-xl'>
                <p className='mb-2 font-bold'>Instagram Post text:</p>
                <ReactMarkdown>{response.instagram}</ReactMarkdown>
            </div>
        </div>





    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Post to Twitter</h1>
      <button onClick={handleConnect} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
        Connect to Twitter
      </button>

      <input
        type="text"
        placeholder="Access Token"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        className="w-full mb-2 px-2 py-1 border"
      />

      <textarea
        placeholder="What's happening?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full mb-2 p-2 border"
      />

      <button
        onClick={handleTweet}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Post Tweet
      </button>

      {result && (
        <pre className="mt-4 bg-gray-100 p-2 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>


    </div>
  );
}
