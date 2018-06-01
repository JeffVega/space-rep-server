'use strict';

const express = require('express');
const QuestionMod = require('../models/question');
const User = require('../models/user')
const {LinkedList,size,displayAndRemove,displayFirstQuestion} = require('../linked-list/linked-list')
const passport = require('passport');
const router = express.Router();

const jwtAuth = passport.authenticate('jwt', {session:false});


// console.log('!!!!!!!!!!!!!!!!!!!!!!!', mainLinkedList);
// function convertArrayQuestions(arr) {
//   arr.forEach(item => {
//     mainLinkedList.insertLast(item);
//   });
//   return mainLinkedList;
// }

function convertListToArray(list) {
  const arr = [];
  let currentNode = list.head;
  while (currentNode.next !== null) {
    arr.push(currentNode.value);
    currentNode = currentNode.next;
  }
  arr.push(currentNode.value);
  return arr;
}

router.get('/question',(req,res) =>{

  QuestionMod.find({})
  .then(results =>{
    res.json(results)
  })
  .catch(err => {
    next(err)
  })
});

router.get('/question/:id',jwtAuth,(req, res, next) => {
  console.log(req.user)

  User.findById(req.user.id)
  .then(user =>{
    console.log('this is here',results)
      res.json(user.questions);
    }) 
    .catch(err=>next);
})


router.post('/question', (req, res) => {
  const {img_url,answer} = req.body;
  // const userId =req.user.id;
  const newQues = { img_url,answer};

  /***** Never trust users - validate input *****/
  if (!QuestionMod) {
    const err = new Error('Missing `QuestionMod` in request body');
    err.status = 400;
    return next(err);
  }

  QuestionMod.create(newQues)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('That QuestionMod already exists');
        err.status = 400;
      }
      next(err);
    });   

});

//**new head needs to end up on client
//**just switching new head for new question 

router.post('/question/update', jwtAuth, (req, res) => {
  const { input } = req.body;
  console.log(input);
  User.findOne({username:req.user.username})
  .then(user => {
  console.log('before user---------', user);
 
      let mainLinkedList = new LinkedList();
      // user.questions
      console.log('​user.questions', user.questions);
      user.questions.map(question => mainLinkedList.insertLast(question) )
      console.log("the size is :",size(mainLinkedList))
      //debug here first
      console.log('the mainLinkedList', mainLinkedList );
      const correctAnswer = mainLinkedList.head.value.answer
      const sizeList = size(mainLinkedList)
      const {input} = req.body
      let userScore = user.score
      let wrongScore = user.wrongTally
       
      let memoryStrength = mainLinkedList.head.value.memoryStrength
      let currNode = mainLinkedList
      // console.log('currNode', currNode);

    //  console.log("the :",input)
        if (correctAnswer === input) {
            console.log('correctAnswer2', correctAnswer);
            userScore++
            mainLinkedList.head.value.memoryStrength *= 2
            mainLinkedList.insertLast(currNode)
            displayAndRemove(currNode)
            // // console.log('​mainLinkedList.insertLast(currNode)', mainLinkedList.insertLast(currNode));
            
            if(sizeList <= mainLinkedList.head.value.memoryStrength){
              mainLinkedList.head.value.memoryStrength =  sizeList
              const mainLinkedListM = mainLinkedList.head.value
              mainLinkedList.insertLast(mainLinkedListM,mainLinkedList.head.value.memoryStrength)
            }
            else{
              const mainLinkedListM = mainLinkedList.head.value
              mainLinkedList.insertLast(mainLinkedListM,mainLinkedList.head.value.memoryStrength)
              
            }
          
        }
        else{
           wrongScore++
           mainLinkedList.head.value.memoryStrength = 1
          const MSM = mainLinkedList.head.value
          mainLinkedList.insertAt(MSM,mainLinkedList.head.value.memoryStrength + 1 )
          displayAndRemove(currNode)
          // console.log('mainLinkedList.next', mainLinkedList.head.next);
          
          
          // console.log('next', next);
          // const tempNext = mainLinkedList.next.next
          // mainLinkedList.next.next = mainLinkedList.head;
          // user.questions[currentQuestion].next = tempNext; 
          // mainLinkedList.insertAt(mainLinkedList.head,memoryStrength)
         
          
        }
        // displayAndRemove(mainLinkedList)
        // // //console.log('​displayAndRemove(mainLinkedList)', displayAndRemove(mainLinkedList));
        // displayFirstQuestion(mainLinkedList)
        
        // // console.log('​our linked list before array',mainLinkedList);
        // // console.log('​displayFirstQuestion(mainLinkedList)', displayFirstQuestion(mainLinkedList));
        // mainLinkedList.head.value.memoryStrength = MemryStrength
        user.wrongTally = wrongScore
        console.log('wrongScore', wrongScore);
        user.score = userScore
        console.log("score!!",userScore)
//  Convert the mainLinkedList back into an Array 
          // user.questions.question = question.img_url
          // console.log('​user.questions.question', user.questions.question);
        
          // user.questions.answer = question.answer
          user.questions =  convertListToArray(mainLinkedList)
     
       
      return User.updateOne({username:req.user.username},{
        $set:{
          questions:user.questions,
          score:user.score,
          wrongTally:user.wrongTally
        }
      })
        .then(()=> {
          return User.findOne({username:req.user.username});
        } );
    })
    .then(user => {
      console.log('after user--------', user);
      
        res.status(200).json(user);
    });
})

// router.post('/question/update', jwtAuth, (req, res) => {
//   const { input } = req.body;
//   console.log(input);
  
//   QuestionMod.findOne({img_url:input.question})
//     .then(answer => {
//       if(answer.answer === input.answer) {
//         User.findOne({username:req.user.username})
//         .then(user => {
//           let userScore = user.score; 
//           userScore++;
//           user.questions.memoryStrength *= 2;
//           res.send('Correct!')
//         })
//       } 
//       else {
//         User.findOne({username:req.user.username})
//         .then(user => {
//           let wrongScore = user.wrongTally;
//           wrongScore++;
//           res.send(`Incorrect. The name is ${answer.answer}`)
//         })

//       }
//     })
    // User.findOne({username:req.user.username})
    //   .then(user => {
    //     const currentQuestion = user.questions[head]
    //     //get current question head value & compare answer to input
    //     if(response.input !== currentQuestion.answer) {
    //       const next = currentQuestion.next; 

    //         user.head = next;
    //         const tempNext = user.questions[next].next;
    //         user.questions[next].next = currentQuestion;
    //         user.questions[currentQuestion].next = tempNext; 
    //     } else {
    //       //moved a couple spots back depending on memeoryStrength
    //       //multiply right memoryStrength x 2
    //       //change next value of question that is certain spots away  
    //       //currentQuestion.memoryStrength * 2
    //       //traverse array to know where to insert
    //       //start at head, head.next = 1 traversal, head.next.next = 2 etc. 
    //       //once it's moved 4 nexts, will move question there

    //     }
    //   })
        // return user.save();
// })


module.exports = router;