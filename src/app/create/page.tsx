'use client';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown'

import { ClientTweetCard } from "@/components/magicui/client-tweet-card";
import { databases } from '@/models/client/config';
import { credentialCollection, db, twitterEnum } from '@/models/name';
import { Query } from 'appwrite';
import { useAuthStore } from '@/store/Auth';

export default function ChatComponent() {
    const {user} = useAuthStore()
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState({
      twitter: '',
      instagram: ''
    });
    const [userTwitterInfo, setUserTwitterInfo] = useState({
      id: '',
      username: '',
      name: '',
      profile_image_url: ''

    })
    const [twitterConnected, setTwitterConnected] = useState(false)


    useEffect(() => {
      const getUserTwitterInfo = async () => {
        try {
          if(!user) return
          const res = await fetch('/api/twitter/status')

          console.log(await res.json())

          if(res.status >= 400){
            const response = await fetch('/api/twitter/refresh')

            if(response.status >= 400){
              console.log(await response.json())
              setTwitterConnected(false)
              return
            }

            const data = await response.json()
            setTwitterConnected(true)
            setUserTwitterInfo(data.data)
            return

          }

          const data = await res.json()
          setTwitterConnected(true)
          setUserTwitterInfo(data.data)

          console.log(data)

        } catch (error) {
          console.log(error)
        }

      }

      getUserTwitterInfo()

      console.log('hhh')
    }, [user])




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


  return (
    <div className=''>
        <p>
          {userTwitterInfo?.username}
        </p>
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask me something..."
        />
        <button onClick={handleSend}>Send</button>
        <button onClick={handleConnect}>Send</button>

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


        <div className=''>
          <ClientTweetCard id="1912817161782845629" />;
        </div>




    </div>
  );
}
