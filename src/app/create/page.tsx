'use client';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown'

import { ClientTweetCard } from "@/components/magicui/client-tweet-card";
import { databases } from '@/models/client/config';
import { credentialCollection, db, twitterEnum } from '@/models/name';
import { Query } from 'appwrite';
import { useAuthStore } from '@/store/Auth';
import { Button } from '@/components/ui/button';

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
          const data = await res.json()
          console.log(data)

          if(!res.ok){
            setTwitterConnected(false)
            setUserTwitterInfo(data.data)
            return
          }

          setTwitterConnected(true)
          setUserTwitterInfo(data.data)


        } catch (error) {
          console.log(error)
        }

      }

      getUserTwitterInfo()

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

  const handlePost = async (text:string) => {
      if(!user) return

      const existingDoc = await databases.listDocuments(db, credentialCollection, [
        Query.equal('platform', twitterEnum),
        Query.equal('userId', user?.$id),
      ])



      const access_token = existingDoc.documents[0].accessToken

      if(!access_token) return


      const res = await fetch('/api/twitter/tweet', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text, access_token})
      })

      const resData = await res.json()

      console.log(resData)
  }


  return (
    <div className=''>
        <p>
          {userTwitterInfo?.username}
        </p>
        <textarea
            className='border'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask me something..."
        />
        <Button onClick={handleSend}>Create Post</Button>



        <div className='flex gap-4 m-4'>
            <div className='w-1/2 p-2 bg-stone-50 border rounded-xl'>
                <p className='mb-2 font-bold'>Twitter Post text:</p>
                <ReactMarkdown>{response.twitter}</ReactMarkdown>
            </div>

            <div className='w-1/2 p-2 bg-stone-50 border rounded-xl'>
                <p className='mb-2 font-bold'>Instagram Post text:</p>
                <ReactMarkdown>{response.instagram}</ReactMarkdown>
            </div>
            {
              !twitterConnected && <Button onClick={handleConnect}>Connect X</Button>
            }
        </div>


        <div className=''>
          <Button className='cursor-pointer m-2' onClick={() => handlePost(response.twitter)}>
            POST TWEET
          </Button>
          {/* <ClientTweetCard id="1912817161782845629" />; */}
        </div>



    </div>
  );
}
