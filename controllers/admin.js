const Job = require("../models/job");

exports.getAddPost = (req, res, next) => {
  res.render("admin/post-job", {
    pageTitle: "Post a Job",
    path: "/admin/post-job",
    editing: false
  });
};

exports.getPostAdmin = (req, res, next) => {
  res.render("admin/posts", {
    pageTitle: "Manager Posts",
    path: "/admin/posts",
  });
};

// Add job post => this function create a new job post on the admin section and display the newly created post on the admin user section
 // Implication of the Save() function => We also need to add 'null' as ID on the Controller 'admin' because it was added to the constructor

exports.postAddPost = (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  const salary = req.body.salary;
  const contract = req.body.contract;
  const location = req.body.location;
  const jobUrl = req.body.jobUrl;
  Job.create({
    title: title,
    description: description,
    salary: salary,
    contract: contract,
    location: location,
    jobUrl: jobUrl,
  }).then(result => {
    console.log('Created Post')
  }).catch(err => {console.log(err)})
  // job.save();
  // res.redirect("/admin/posts");
  // console.log(job);
};



exports.getJobById = (req,res, next) =>{
  const jobId =req.params.jobId;
  Job.findById(jobId, job =>{
    res.render('admin/edit-post', {
      pageTitle: 'Edit Job Post',
      path: '/admin/post',
      job: job,
    })
  })

}
// Function to display all created jobs on the Admin manager section
exports.getJobs = (req, res, next) => {
    Job.findAll().then(jobs =>{      res.render("admin/posts", {
      jps: jobs,
      pageTitle: "Admin Jobs Manager",
      path: "/admin/posts",
      hasJobs: jobs.length > 0,
    });}).catch(err => {console.log(err)});

};


exports.getEditJob = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode) {
    return res.redirect('/')
  }
  const jobId = req.params.jobId;
  Job.findById(jobId, job => {
    if(!job) {
      return res.redirect('/');
    }
    res.render('admin/post-job', {
      pageTitle: 'Edit Post',
      path: ' /admin/edit-post',
      editing: editMode,
      job: job
    })
  })
}

// This function edit the job posted on the admin user section 
// First we fetch information on the post
// Then we create a new product/post instance
// To get the ID we must include a hiddin field on the ejs file to hold the product ID
exports.postEditJob = (req, res, next) => {
  const jobId = req.body.jobId;
  const updatedTitle = req.body.title;
  const updatedDescription = req.body.description;
  const updatedSalary = req.body.salary;
  const updatedContract = req.body.contract;
  const updatedLocation = req.body.location;
  const updateddUrl = req.body.jobUrl;
  const updatedJob = new Job (
    jobId, 
    updatedTitle, 
    updatedDescription, 
    updatedSalary, 
    updatedContract, 
    updatedLocation, 
    updateddUrl
  );
  console.log(updatedJob)
  updatedJob.save();
  res.redirect('/admin/posts')

};

exports.postDeleteJob = (req, res, next) => {
  const jobId = req.body.jobId;
  Job.deleteByID(jobId);
  console.log(jobId)
  res.redirect('/admin/posts')
}

// exports.getJobs = (req, res, next) => {
//   Job.fetchAll(jobs => {
//     res.render("admin/jobs", {
//       jps: jobs,
//       pageTitle: "Admin Jobs Manager",
//       path: "/admin/jobs",
//     });
//   });
// };
