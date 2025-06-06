import React, { useEffect, useState, useContext } from 'react';
import { ProfileStats } from '../../components/profile/ProfileStats';
import { ArticleCard } from '../../components/profile/ArticleCard';
import { NFTCard } from '../../components/profile/NFTCard';
import { AvatarUpload } from '../../components/profile/AvatarUpload';
import { BeakerIcon, BookOpenIcon, PencilIcon, CheckIcon, XIcon } from 'lucide-react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { BACKEND_URL } from '../../config';
import { toast } from 'react-hot-toast';

function Profile() {
  const { user, setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(user);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedProfile(user);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, file } = e.target;
    console.log(name, value);
    
    if (file) {
      setAvatarFile(file);
    }
    
    setEditedProfile(prevProfile => {
      const updatedProfile = {
        ...prevProfile,
        [name]: value
      };
      console.log('Updated profile:', updatedProfile);
      return updatedProfile;
    });
  }

  const handleSave = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        Object.keys(editedProfile).forEach(key => {
          if (key !== 'avatar') {
            formData.append(key, editedProfile[key]);
          }
        });

        response = await axios.put(`${BACKEND_URL}/edit_profile/${user.id}`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        if(response.status == 200) {
          setUser(prev => ({
            ...prev,
            avatar: response.data.user.avatar
          }))
        }
      } else {
        response = await axios.put(`${BACKEND_URL}/edit_profile/${user.id}`, editedProfile, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.status === 200) {
        setUser(response.data.user || response.data);
        setIsEditing(false);
        setAvatarFile(null);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(user);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {!user ? (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600 dark:text-gray-400">Please login to view your profile</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className={`
            lg:w-80 bg-white dark:bg-gray-800 shadow-xl
            fixed lg:sticky top-0 h-screen
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            z-40
          `}>
            {/* Mobile close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XIcon className="w-6 h-6" />
            </button>

            {/* Profile Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sm:mt-10 lg:mt-0 mt-10">
              <div className="flex justify-end mb-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className={`flex items-center gap-1 ${
                        isLoading 
                          ? 'bg-green-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white px-3 py-1 rounded-lg transition-colors`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className={`flex items-center gap-1 ${
                        isLoading 
                          ? 'bg-red-400 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-700'
                      } text-white px-3 py-1 rounded-lg transition-colors`}
                    >
                      <XIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  {isEditing ? (
                    <AvatarUpload
                      currentAvatar={editedProfile.avatar}
                      onAvatarChange={handleChange}
                    />
                  ) : (
                    <img
                      src={`http://localhost:8000${user.avatar}`}
                      alt={user.username}
                      className="w-24 h-24 rounded-full border-4 border-purple-500 dark:border-purple-400"
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={editedProfile.username}
                        onChange={handleChange}
                        className="text-2xl font-bold bg-transparent border-b-2 border-purple-500 dark:text-white focus:outline-none text-center"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.username}
                      </h1>
                    )}
                    <BeakerIcon className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="p-6">
              {/* <ProfileStats stats={profile.stats} /> */}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden fixed bottom-4 left-4 z-50 bg-purple-600 text-white p-4 rounded-full shadow-lg"
          >
            <BeakerIcon className="w-6 h-6" />
          </button>

          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0">
            <div className="max-w-6xl mx-auto">
              {/* Articles Section */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scientific Articles</h2>
                </div>
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
                  {articles.map(article => (
                    <ArticleCard key={article.id} article={article} isEditing={isEditing} />
                  ))}
                </div>
              </div>

              {/* NFTs Section */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">NFT Collection</h2>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map(nft => (
                    <NFTCard key={nft.id} nft={nft} isEditing={isEditing} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;