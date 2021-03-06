<template>
    <div class="container-fluid bg-white">
        <NavBar></NavBar>
        <br><br>
        <div class="row">
            <div class="col-12">
                <br>
                <br>
                <div class="row">
                    <div class="col padding-left-right-15" style="margin-bottom: 10px">
                        <h1><b>Video content</b></h1>
                    </div>
                    <div class="col container row justify-content-end" >
                        <v-btn
                            class="ma-2 elevation-0"
                            color="white"
                            @click="uploadVideo"
                            >
                            <v-icon left>mdi-plus</v-icon>
                            Upload video
                        </v-btn>
                    </div>
                </div>
                <v-data-table
                    v-model="selected"
                    :headers="headers"
                    :items="videos"
                    item-key="name"
                    show-select
                    class="elevation-1"
                >
                    <template v-slot:item.title="{ item }">
                        <div class="card" style="max-width: 500px;  border: 0; background-color: transparent">
                            <div class="row no-gutters">
                                <div class="col-sm-5">
                                    <video
                                        style="max-height: 150px"
                                        class="card-img h-100 align-items-center video-mask" 
                                        v-bind:src="`http://localhost:8000/v1/videos/stream/${item.url}`" 
                                    />
                                    <div class="overlayText" style="margin: 15px 10px">
                                        <p class="bottomText text-white" style="">
                                            <span v-if="item.duration">{{item.duration}}</span>
                                            <span v-else>{{duration}}</span>
                                        </p>
                                    </div>
                                </div>
                                <div class="col-sm-7">
                                    <div class="card-body h-100 w-100 align-items-center mr-0 pr-0">
                                        <p class="card-title">
                                            <span v-if="item.title.length<60">{{item.title}}</span>
                                            <span v-else>{{ item.title.substring(0,60)+".." }}</span>
                                        </p>
                                        <p class="card-text text-secondary" style="margin-top: -10px">
                                            <span v-if="item.description.length<60">{{item.description}}</span>
                                            <span v-else>{{ item.description.substring(0,60)+".." }}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-slot:item.created_at="{ item }">
                        {{ new Date(item.created_at).toLocaleString() }}
                    </template>
                    <template v-slot:item.visibility="{ item }">
                        <span v-if="item.visibility == 0">Public</span>
                        <span v-else-if="item.visibility == 1">Private</span>
                        <span v-else-if="item.visibility == 2">Followers</span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <v-icon class="mx-2" @click="onEditButtonClick(item)">mdi-pencil</v-icon>
                        <v-icon class="mx-2" @click="onDeleteButtonClick(item)">mdi-delete</v-icon>
                    </template>
                    <template v-slot:item.restriction="{ item }">
                        <v-icon v-if="item.recognition_result" class="mx-2"  @click="onViewRecognitionResult(item)">mdi-alert-circle</v-icon>
                        <v-icon v-else class="mx-2">mdi-check-circle</v-icon>
                    </template>
                </v-data-table>
            </div>
        </div>
        <DeleteConfirmation v-bind:deleteDialog="deleteDialog" @onClose="deleteDialog.isOpened = $event"/>
        <ShowRecognitionResult v-bind:recognitionDialog="recognitionDialog" @onClose="recognitionDialog.isOpened = $event"/>
    </div>
</template>

<script>
import NavBar from '../common/NavBar.vue'
import DeleteConfirmation from './DeleteConfirmation.vue'
import ShowRecognitionResult from './ShowRecognitionResult.vue'
import { RepositoryFactory } from '../../utils/repository/RepositoryFactory'
import { convertJSONToObject } from '../../utils/utils'
const VideoRepository = RepositoryFactory.get('video')

export default {
    components: {
        NavBar,
        DeleteConfirmation,
        ShowRecognitionResult
    },
    data () {
      return {
        selected: [],
        headers: [
          {
            text: 'Video',
            align: 'start',
            sortable: false,
            value: 'title',
          },
          { 
              text: 'Restriction', 
              value: 'restriction' 
          },
          { 
              text: 'Visibility', 
              value: 'visibility',
              sortable: false
          },
          { 
              text: 'Date', 
              value: 'created_at' 
          },
        //   { 
        //       text: 'Views', 
        //       value: 'total_views',
        //   },
          { 
              text: 'Comments', 
              value: 'total_comments'
          },
          { 
              text: 'Likes', 
              value: 'total_likes'
          },
          { 
              text: 'Actions', 
              value: 'actions'
          },
        ],
        videos: [],
        confirmCheckbox: false,
        deleteDialog: {
            isOpened: false,
            video: {}
        },
        recognitionDialog: {
            isOpened: false,
            recognitionResult: {}
        },
        username : '',
        duration: '00:00'   
      }
    },
    methods: {
        async getAllVideos () {
            const user = JSON.parse(localStorage.getItem('user'));
            const author_id = user._id;
            const username = user.username;
            this.username = username;
            if (this.$route.params.username == username) {
                try {
                    const { data } = await VideoRepository.getAllVideoInfosWithUserId(author_id);
                    if (data) {
                        const dataObject = convertJSONToObject(data);
                        if (!dataObject.details) {
                            return dataObject;
                        }
                    } 
                    return null;
                } catch (error) {
                    if (error.response) {
                        alert(error.response.data);
                    }
                }
            }
        },
        handleRowClick(row) {
            console.log(row)
			this.$router.push({ path: `/${this.username}/videos/${row._id}`})
        },
        onEditButtonClick(row) {
			this.$router.push({ path: `/${this.username}/videos/${row._id}`})
        },
        onDeleteButtonClick(row) {
            this.deleteDialog.isOpened = true;
            this.deleteDialog.video = row
        },
        onViewRecognitionResult(row) {
            this.recognitionDialog.isOpened = true;
            this.recognitionDialog.recognitionResult = row.recognition_result;
        },
        uploadVideo() {
            this.$router.push({ path: `/upload` })
        },
    },
    async mounted() {
        //TO-DO: Check if videos is ull
        this.videos = await this.getAllVideos();
    },
}
</script>

<style scoped>
.selected {
    background-color: red
}
</style>
