import React, { useMemo, useState } from 'react'
import UserAvatar from '../components/UserAvatar'
import apiClient from '../services/api'
import { useParams } from 'react-router-dom'
import { useAuth } from '../services/AuthProvider'
import { Toastify } from '../components/Toastify'

export const SingleUser = () => {
  const { loggedInUser } = useAuth()
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [counter, setCounter] = useState({
    followers: 0,
    following: 0,
  })
  const [isFollowing, setIsFollowing] = useState(false)
  const [isUpdated, setIsUpdated] = useState(true)

  const dataProfile = useMemo(() => {
    apiClient({
      method: 'get',
      url: `/api/v1/users/${id}`
    }).then(response => {
      setProfile(response.data)
    }).catch(error => {
      Toastify('error', error.response.data)
    })
  }, [])

  const dataValidate = useMemo(() => {
    apiClient({
      method: 'post',
      url: '/api/v1/validate_follow/',
      data: {
        follow: {
          follower_id: loggedInUser.id,
          followed_id: id
        }
      }
    }).then(response => {
      setIsFollowing(response.data)
    }).catch(error => {
      Toastify('error', error.response.data)
    })

    setIsUpdated(false)
  }, [isUpdated])

  const dataCounter = useMemo(() => {
    apiClient({
      method: 'get',
      url: `/api/v1/user_follows/${id}`
    }).then(response => {
      setCounter(response.data)
      console.log(response.data)
    }).catch(error => {
      Toastify('error', error.response.data)
    })

    setIsUpdated(false)
  }, [isUpdated])

  const toggleFollow = () => {
    apiClient({
      method: 'post',
      url: isFollowing ? '/api/v1/unfollow' : '/api/v1/follow',
      data: {
        follow: {
          follower_id: loggedInUser.id,
          followed_id: id
        }
      }
    }).then(response => {
      Toastify('success', `Successfully ${isFollowing ? 'unfollowed' : 'followed'} ${profile.username}`)
      setIsUpdated(true)
    }).catch(error => {
      console.log(error)
    })
  }

  return (
    <div id='single-user'>
      <div className='flex justify-between items-center'>
        <h4 className='text-lg text-primary font-bold'>{(profile && profile.username.toUpperCase() + "'s Profile") || 'Undefined User'}</h4>
        <a href='/users' className='bg-primary hover:bg-transparent text-white hover:text-primary border border-primary py-2 px-5'>View Other Users</a>
      </div>
      <hr className='mt-1 mb-4' />
      {
        profile &&
        <div className='pub-profile flex flex-col gap-3'>
          <div className='border-2 border-success'>
            <UserAvatar avatar={profile.avatar.url} />
          </div>
          {
            id !== loggedInUser.id ?
              <button
                onClick={toggleFollow}
                className={`${isFollowing ? 'bg-danger hover:text-danger border-danger' : 'bg-primary hover:text-primary border-primary'} hover:bg-transparent text-white border py-2 px-5`}
              >
                {
                  isFollowing ?
                    <>
                      UNFOLLOW
                    </>
                    :
                    <>
                      FOLLOW
                    </>
                }
              </button>
              :
              <></>
          }
          <div className='grid grid-cols-2'>
            <div className='flex flex-col text-center'>
              <div className='font-bold'>{counter.followers}</div>
              <div className='text-sm'>Followers</div>
            </div>
            <div className='flex flex-col text-center'>
              <div className='font-bold'>{counter.following}</div>
              <div className='text-sm'>Following</div>
            </div>
          </div>
        </div>
      }
    </div>
  )
}
