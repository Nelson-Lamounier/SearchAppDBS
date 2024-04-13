const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'posts.json'
);

module.exports = class Post {
  static addPost(id) {
    // Fetch the previous cart
    fs.readFile(p, (err, fileContent) => {
      let job = { posts: []};
      if (!err) {
        job = JSON.parse(fileContent)
      }
      // Analyze the posts card => Find existing job
      const existingPostIndex = job.posts.findIndex (postId => postId.id === id);
      const existingPost = job.posts[existingPostIndex];
      let updatedPost;
      // Add new post
      if(existingPost) {
        updatedPost = {...existingPost };
        job.posts = [...job.posts]
        job.posts[existingPostIndex] = updatedPost;
      } else {
        updatedPost = {id: id};
        job.posts = [...job.posts, updatedPost]
      }
      fs.writeFile(p, JSON.stringify(job), err => {
        console.log(err)
        console.log(job)
      })
    })
  }

  static deletePost(id) {
    fs.readFile(p, (err, fileContent) => {
      if(err) {
        return;
      }
      const updatedJob = {...JSON.parse(fileContent)};
      const job = updatedJob.posts.find(post => post.id === id);
      
      updatedJob.posts = updatedJob.posts.filter(postId => postId.id !== id);

      fs.writeFile(p, JSON.stringify(updatedJob), err => {
        console.log(err)
      })
    })
  }
// Get Products from the user cart to display on the search section of the application
  static getPost(cb) {
    fs.readFile(p, (err, fileContent) => { // Function to read the file
      const post = JSON.parse(fileContent)
      if(err) {
        cb(null);
      } else {
        cb(post)
      }

    })
  }
}