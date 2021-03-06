import Vue from 'vue'
import VueRouter from 'vue-router'
import Authentication from './views/Authentication.vue'
import Register from './views/Register.vue'
import Editing from './views/Editing.vue'
import Home from './views/Home.vue'
import UploadVideo from './views/UploadVideo.vue'
import Upload from './components/upload-video/Upload.vue'
import VideoManagement from './components/video-management/ListVideos.vue'
import VideoDetails from './components/video-management/VideoDetails.vue'
import UserManagement from './components/user-management/ListUsers.vue'
import Profile from './components/profile/Profile.vue'
import EditProfile from './components/profile/EditProfile.vue'

import Comment from './views/Comment.vue'
import Search from './components/discover/Search.vue'
import Posts from './components/home/Posts.vue'
import Trending from './components/discover/Trending.vue'
import Filter from './components/video-editing/filters/Filters.vue'
import MyMedia from './components/video-editing/my-media/MyMedia.vue'
import BrowseFile from './components/video-editing/browse-files/BrowseFile.vue'
import PageNotFound from './views/PageNotFound.vue'

Vue.use(VueRouter)

export const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/', 
            component: Home,
            redirect: '/home',
            children: [
                {
                    path: '/search/:id', 
                    component: Search 
                },
                {
                    path: '/search', 
                    component: Search 
                },
                {
                    path: '/home', 
                    component: Posts 
                },
                {
                    path: '/trending/:id', 
                    component: Trending
                },
                {
                    path: '/trending', 
                    component: Trending
                }
            ]
        },
        {
            path: '/editing', 
            component: Editing,
            redirect: '/editing/mymedia',
            children: [
                {
                    path: '/editing/filter', 
                    component: Filter 
                },
                {
                    path: '/editing/mymedia', 
                    component: MyMedia
                },
                {
                    path: '/editing/browsefile', 
                    component: BrowseFile
                }
            ]
        }, 
        { 
            path: '/users/', 
            component: UserManagement,
            meta: {
                requiresAuth: true,
                isAdmin: true
            }
        },
        { 
            path: '/:username/profile', 
            component: Profile,
        },
        { 
            path: '/:username/profile/edit', 
            component: EditProfile,
        },
        { 
            path: '/:username/videos/', 
            component: VideoManagement,
            meta: {
                requiresAuth: true
            }
        },
        { 
            path: '/:username/videos/:id', 
            component: VideoDetails,
            meta: {
                requiresAuth: true
            }
        },
        { 
            path: '/login/', 
            component: Authentication,
        },
        { 
            path: '/signup/', 
            component: Register,
        },
        { 
            path: '/comment/:id', 
            component: Comment,
            meta: {
                requiresAuth: true
            }
        },
        { 
            path: '/upload', 
            component: Upload,
            meta: {
                requiresAuth: true
            }
        },
        { 
            path: "*", 
            component: PageNotFound 
        }
        // {path: '/browsefile', component: BrowseFile}
    ]
})

// Meta Handling
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('token') == null) {
      next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      })
    } else {
      let user = JSON.parse(localStorage.getItem('user'))
      if (to.matched.some(record => record.meta.isAdmin)) {
        if (user.is_admin == 1) {
          next()
        } else {
          next({ path: '/login' })
        }
      } else {
        next()
      }
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (localStorage.getItem('token') == null) {
      next()
    } else {
      next({ path: '/home' })
    }
  } else {
    next()
  }
})
