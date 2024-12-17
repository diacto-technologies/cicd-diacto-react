import { useParams } from "react-router-dom";
import { useEffect,useState,useRef  } from "react";
import { useNavigate } from 'react-router-dom';
import "../../utils/react-quill/Toolbar.css"
import 'react-quill/dist/quill.snow.css';
import Instruction from "./Instruction";
import TestEnd from "./TestEnd";
// candidate interface
const CandidateInterface = () => {
    const { candidateId, testlogId, uniqueId } = useParams();

    console.log(candidateId, testlogId, uniqueId)
    const [questions, setQuestions] = useState([])
    const [questionstype, setQuestionstype] = useState('')
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentTest, setCurrentTest] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [IsLastQuestion, setIsLastQuestion]=useState(false)
    const [IsLastTest, setIsLastTest]=useState(false)
    const [TestStarted, setTestStarted] = useState(false);
    const [timer, setTimer] = useState(0);
    const [tests,setTests] = useState([])
    const [choices,setChoices] = useState([])
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedChoice, setSelectedChoice] = useState([]);
    const [textanswer, setTextanswer] = useState("");
    const [selectedChoiceIds, setSelectedChoiceIds] = useState([]);
    const [currentTestIndex,setCurrentTestIndex] = useState(0)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isContentVisible, setContentVisible] = useState(false);
    const [startTime, setstartTime] = useState(null);
    const [CompleteTime, setCompleteTime] = useState(null);
    const [TestComplete, setTestComplete] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [text, setText] = useState('');
    const [datevalid, setDateValid] = useState(false);
    
     

    const StartTest = (time) => {
        setContentVisible(true)
        setstartTime(time)
        setTestStarted(true)
         
        fetchQuestion(currentTest.question[0])
        setCurrentQuestionIndex(0)
        setCurrentTestIndex(0)
          
        // questionTimer()
    };

    async function testStatus(){
        console.log('teststatus')
        setLoading(true)
        try{
            
            // ?test_id=${currentTest.id}&
            const response = await fetch(`/test/test-status/?test_log=${testlogId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
                // body:JSON.stringify(payload)
        })
        if (!response.ok) {
            throw new Error('Network response was not ok');
           
        }
        const data = await response.json();
        console.log(data,'teststatus')
        if(data){

        const completedTests = data.filter(test => !test.completed);
        console.log(completedTests.length===0)
        if(completedTests.length>0){
            console.log(completedTests,'remaining test')
            const remainingTests =completedTests.map((remaining_tests)=>remaining_tests.test)
            console.log(remainingTests[0],remainingTests[0].question || [])
            setTests(remainingTests)
            setCurrentTest(remainingTests[0])
            setQuestions(remainingTests[0]?.question || [])
        }
        else{
            console.log(completedTests,'completed')
        }
        }
    }catch (error) {
        setLoading(false);
        console.log(error)
        setError(error);
        return true;
    }
    return true;
}
    
    // Fetching testLog Details
    async function fetchTestLog (){
        
        setLoading(true)
        try{

            const response = await fetch(`/test/testlog/${testlogId}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
        })
        if (!response.ok) {
            throw new Error('Network response was not ok');
           
        }
        const data = await response.json();
        console.log(data,data.test,'testlog details')
        if(data.completed){
            setText('You Have Given This Test')
            setTestComplete(true)
        }
        const test_expire = new Date(data.valid_to) < new Date() 
        if(test_expire){
            setDateValid(test_expire)
            setText('Test Link Exipred Contact The Recruiter')
        }
        // if(data && data.test.length>0){

        //     setTests(data.test)
        //     setCurrentTest(data.test[0])
        //     setQuestions(data.test[0].question || [])
        // }
        }catch (error) {
            setLoading(false);
            console.log(error)
            setError(error);
  
    }
    
}
async function fetchQuestion(id){
    console.log(currentTest,'test')
    try {
            // Create an array of fetch promises for each question ID
            
              const response =await fetch(`/test/questions/${id}/`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + String(authTokens.access),
                }
              }) 
            const data =await response.json()
            if (data){
                setCurrentQuestion(data)
                if (data?.choices) {
                    console.log(data?.type === 'text','questiontype')
                    const parsedChoices = JSON.parse(data.choices);
                    setChoices(parsedChoices);
                  }
                if(data?.type === 'multiple'){
                    setQuestionstype('checkbox')
                }
                else if(data?.type === 'text'){
                    setQuestionstype('text')
                }
                else if(data?.type === 'audio'){
                    setQuestionstype('audio')
                }
                else{
                    setQuestionstype('radio')
                }
                
                setTimer(parseInt(data.time_limit || 0) )
            }
            
          } catch (error) {
            setLoading(false);
            console.log(error)
            setError(error);
          }
}

// console.log(selectedChoice)
    // async function fetchQuestion(id){
    //     console.log(selectedTestIndex)
    // if(questions.length ===  selectedTestIndex ){
    //     console.log('Test Ended')
    // }
    // else{
    //     console.log(selectedTestIndex,'test index')
    // const questionIds = questions[selectedTestIndex].question_id
    // // console.log(questionIds,questionsdetails)
    
    // // setQuestionsDetails([]);
    //     try {
    //     // Create an array of fetch promises for each question ID
    //     const fetchPromises = questionIds.map(id =>
    //       fetch(`/test/questions/${id}/`, {
    //         method: "GET",
    //         headers: {
    //           "Content-Type": "application/json",
    //         }
    //       }).then(response => response.json()) // Convert response to JSON
    //     );
    //     // Wait for all fetch promises to resolve
    //     const results = await Promise.all(fetchPromises);
    //     setQuestionsDetails(results);
    //     const time_limit =results.map((question)=>({
    //         question_id:question.id,
    //         question_time:question.time_limit
            
    //     }))
    //     setQuestionstime(time_limit)
    //     // Set the combined data state
    //   } catch (error) {
    //     setLoading(false);
    //     console.log(error)
    //     setError(error);
    //   }
    // }

    //     }
    
    // console.log(selectedTestIndex,tests.length,questionstime[currentQuestionIndex].question_time,'timelimit')
    // get the testlog
    useEffect(() => {
        fetchTestLog();
        testStatus();
    //     const initialize = async () => {
    //     const shouldFetchLog = await testStatus();
    //     if (shouldFetchLog) {
    //         console.log('running fetchtestlog')
    //         await fetchTestLog();
    //     }
    // };

    // initialize();        
    }, [])

      
    // update test log started_at time  
    async function updateTestLog(){
        console.log(CompleteTime,'callled')
        setLoading(true)
        const payload={
            started_at: startTime,
            completed_at:CompleteTime,
            completed:true
        }
        try{

            const response = await fetch(`/test/testlog/${testlogId}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
                body: JSON.stringify(payload),
        })
        if (!response.ok) {
            throw new Error('Network response was not ok');
           
        }
        const data = await response.json();
        console.log(data,'update testlog')
        }catch (error) {
            setLoading(false);
            console.log(error)
            setError(error);
        }
    }
    useEffect(() => {
        console.log(startTime,IsLastTest,TestComplete,'starttime')
        if(IsLastTest && TestComplete){
           
            updateTestLog()
        }
    },[TestComplete,IsLastTest])


        // Timer
        useEffect(() => {

            if (TestStarted) {
                console.log('Test Started')
                const interval = setInterval(() => {
                    setTimer(prevTimer => {
                    if (prevTimer > 0) {
                        return prevTimer - 1;
                    } else {
                        console.log(TestStarted,'starting')
                            saveAnswer()
                            
                    }
                    });
                }, 1000);
                
                return () => clearInterval(interval);
                }
                else{
                    console.log('testEnded')
                }
        }, [TestStarted,selectedChoice,textanswer,currentQuestion]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Handle Option clicked
    function handleCorrectChange(choice,e){
        console.log(e.target.type,'selected type')
        if(e.target.type==='radio'){
            console.log(choice,selectedChoice,'selected')
            setSelectedChoice([choice]);
            setSelectedChoiceIds([choice.id])
        }
        if(e.target.type==='checkbox'){

            console.log(choice,selectedChoice,'checkbox')
            setSelectedChoice(previous=> [...previous,choice]);
            setSelectedChoiceIds(previous=> [...previous,choice.id])

        }
        

    }
    function handleinputChange(id,value){
        console.log(value,'text answer')
        setTextanswer(value);

    }
    // Check Answers
    
    async function saveAnswer(){
        console.log(selectedChoice,currentQuestion.id,textanswer,'clicked Answer')
        setLoading(true)
    
        const payload = {
            question_id: currentQuestion.id,
            candidate_id: candidateId,
            choices: selectedChoice || [],
            text :textanswer,
            audio_file:[]
            
        }
        console.log(payload,'payload')
        
        try{
            
            const response = await fetch(`/test/answers/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
                body : JSON.stringify(payload) 
            })
            if (!response.ok) {
                throw new Error('Network response was not ok');
                
            }
            const data = await response.json();
            console.log(data)
            
            
                
            if(response.status===200){
                console.log(tests,currentTestIndex === tests.length,'current test')
                
    
                if(currentQuestionIndex===currentTest.question.length-1 ){
                   
                    // setIsLastQuestion(true)
                    if(currentTestIndex < tests.length-1)
                        {
                            console.log('Next Test')
                            SubmitTest()
                            setShowDeleteModal(true)
                            setCurrentTestIndex(previous=>{
                                const newIndex = previous + 1;

                                setCurrentTest(tests[newIndex])
                                setQuestions(tests[newIndex].question || [])
                                // console.log(currentQuestionIndex,' questionindex')
                                fetchQuestion(tests[newIndex].question[currentTestIndex])
                                return newIndex
                            })
                            setCurrentQuestionIndex(0)
                            setTextanswer('')
                            // setTimer(parseInt(tests[currentTestIndex+1].time_limit))
                        }
                        else{
                            console.log('last Test')
                            setIsLastTest(true)
                            setShowDeleteModal(true)
                            setTestStarted(false)
                            setTestComplete(true)
                            setCompleteTime(new Date())
                            SubmitTest()
                        }
                        // SubmitTest()

                    
                }
                else{
                    console.log(selectedChoice)
                    fetchQuestion(currentTest.question[currentQuestionIndex+1])
                    setCurrentQuestionIndex(previous=>previous+1)
                    setSelectedChoiceIds([])
                    setSelectedChoice([])
                }  
            }
                    }catch (error) {
                        setLoading(false);
                        console.log(error)
                        setError(error);
                        
                    }
                    
                }
    async function SubmitTest(){
        console.log(currentTest.id,'test id')
        const payload = {
            candidate_id:candidateId,
            test_logid:testlogId,
            test_id:currentTest.id
        }
        const response = await fetch(`/test/result/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + String(authTokens.access),
            },
            body:JSON.stringify(payload)
        })
        if (!response.ok) {
            throw new Error('Network response was not ok');
        
        }
        if(response.status===200){
            
            setShowDeleteModal(true)
        }
    }
    
    function NextTest(){
        setShowDeleteModal(false)
        // setCurrentTestIndex(previous=>previous+1)
        console.log(currentTestIndex,currentTest,'test index')
    }
    const handleStopRecording = () => {
        setIsRecording(false);
        // Stop recording logic
    };
    const handleStartRecording = async() => {
        // if (!audioStream) {

        //     console.log("creating new stream...............................")
        //     const streamData1 = await navigator.mediaDevices.getUserMedia({
        //         audio: true,
        //         video: false,
        //     });

        // setAudioStream(streamData1)
        // //create new Media recorder instance using the stream
        // const audiomedia = new MediaRecorder(streamData1, { type: "audio/webm" });    
        // //set the MediaRecorder instance to the mediaRecorder ref
        // audioMediaRecorder.current = audiomedia;
      
        // }else {

        //     console.log("using existing stream>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        //     //create new Media recorder instance using the stream
        //     const audiomedia = new MediaRecorder(audioStream, { type: "audio/webm" });
        //     //set the MediaRecorder instance to the mediaRecorder ref
        //     audioMediaRecorder.current = audiomedia;
        // }
        // //invokes the start method to start the recording process
        // audioMediaRecorder.current.start();
        setIsRecording(true)


        // let localAudioChunks = [];
        // audioMediaRecorder.current.ondataavailable = (event) => {

        //     console.log("audio ", event.data)
        //     if (typeof event.data === "undefined") return;
        //     if (event.data.size === 0) return;
        //     localAudioChunks.push(event.data);
        //     setAudioChunks(localAudioChunks);}
        // const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        // const url = URL.createObjectURL(audioBlob);
        // setAudioAnswers((prev) => ({ ...prev, [currentQuestion.id]: url }))
    };
    console.log(currentTestIndex,'current question')
    return(
        <>
        {TestComplete ?(
                <TestEnd
                text={text}
                />
        ):datevalid?(
            <TestEnd
                text={text}
                />
        ):!isContentVisible?(
                
            <Instruction 
            StartTest={StartTest}
            total_question={tests.map((test)=>test.total_question).reduce((sum, length) => sum + length, 0)} 
            total_test = {tests.length}
            total_time = {tests.map((test)=>test.time_duration).reduce((sum, length) => sum + length, 0)}/>
            ):(
                
                <div className="h-screen w-full flex items-center justify-center bg-transparent md:bg-gray-50 lg:px-14 lg:py-5">
                    <div className="background-svg bottom-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                            <path fill="#0099ff" fillOpacity="1" d="M0,64L48,53.3C96,43,192,21,288,64C384,107,480,213,576,229.3C672,245,768,171,864,165.3C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        </svg>
                    </div>
                    <div className=" w-full bg-transparent md:bg-white relative z-10 flex flex-col h-90 rounded-3xl overflow-auto md:overflow-hidden">
                      
                         <div className="h-screen w-full overflow-hidden flex">
                    
                         {/* sidebar  */}
                         <div className="h-full w-1/5 py-5 bg-white border-r" >
                             <div className="w-full p-3 ps-5 ">
                                 <label className="font-medium text-xl leading-8 text-slate-900">Tests</label>
                                 <div className="p-3 mt-2 flex flex-wrap gap-3 font-bold text-blue-900">
                                 {
                                    tests.length > 0 && tests.map((test,index) => (
                                        <button type="button" key={index}>
                                            <div className={`w-[30px] h-[30px] flex items-center justify-center rounded-full  ${currentTestIndex === index ? "bg-blue-200" : "bg-gray-200"} hover:border hover:border-sky-300 cursor-pointer shadow-sm`}>{console.log(currentTestIndex,index)}{index + 1}</div>
                                        </button>
        
                                ))}
                                </div>
                            </div>
                            <div className="w-full p-3 pb-4 ps-5 mt-5 border-b">
                                <span>Questions</span>
                                <div className="p-3 mt-2 flex flex-wrap gap-3 font-bold text-blue-900">
                                   {console.log(questions.length)}
                                    {questions.length > 0 && questions.map((question,index) => (
                                        <button type="button" key={index} >
                                            <div className={`w-[30px] h-[30px] flex items-center justify-center rounded-full  ${currentQuestionIndex === index ? "bg-blue-200" : "bg-gray-200"} hover:border hover:border-sky-300 cursor-pointer shadow-sm`}>{index + 1}</div>
                                        </button>
        
                                    ))} 
                                  
                                </div>
                            </div>
                        </div>
        
                        {/* body  */}      
                           
                                <div className="bg-white w-full h-full shadow-md rounded-lg grow"> 
                                    <div className="w-full flex items-center justify-between p-3 ps-5 mt-5 border-b">            
                                        <label className="font-medium text-xl leading-8 text-slate-700">Questions</label>    
                                        <label className="font-medium text-xl leading-8 text-slate-700">{formatTime(timer)}</label>    
                                    </div>
                                    <div className="w-full flex items-center justify-between p-3 ps-5 mt-8">            
                                        <b>{currentQuestion?.text}</b>
                                    </div>
                                    <div className="w-full flex flex-col items-start p-3 ps-5 mt-5">            
                                         {questionstype==='text' ?(
                                             choices.map((choice,index) => (
                                             <input
                                            type={questionstype}
                                            name="text-answer"
                                            // value={choice.value}
                                            key = {choice.id}
                                            className="ps-2 w-5/6 flex-grow border p-1 rounded-md"
                                            onChange={(e) => handleinputChange(choice.id,e.target.value)}
                                            placeholder="Enter Your Answer"
                                         />
                                             ))
                                         ):questionstype === 'audio'?(
                                                    <button
                                                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                                                    className={`px-3 py-2 rounded-md text-white shadow-sm ring-2 ${isRecording ? 'bg-red-600/70' : 'bg-green-600/70'}`}
                                                >
                                                    {isRecording ? "Stop Recording" : "Start Recording"}
                                                </button>
                                         ):(
                                            
                                         choices.map((choice,index) => (
                                            <div className="p-3 flex items-center mb-2" key={choice.id}>
                                                
                                                <input
                                                    type={questionstype}
                                                    checked={selectedChoiceIds.includes(choice.id)} 
                                                    onChange={(e) => handleCorrectChange(choice,e)}
                                                    value={choice[index]}
                                                    className="mr-2"
                                                />
                                                <label className="font-medium text-xl leading-8 text-slate-700">{choice.value}</label> 
                                            </div>
                                        ))     
                                         )}
                                    </div>
                                    <div className="w-full flex items-center justify-end p-3">
                    
                                        {IsLastQuestion  ?(
                                            
                                            <button onClick={saveAnswer} className="px-3 py-1.5 text-sm text-white rounded-md bg-primary-600">Submit</button>
                                        ):(
                                            <button onClick={saveAnswer}  className="px-3 py-1.5 text-sm text-white rounded-md bg-primary-600">Save</button>
        
                                        )
        
                                        }
                                    </div>                             
                                </div>
                            
                        </div>
                        </div>               
                    </div >        
            )}
            {
                showDeleteModal &&
                <div className="relative  z-30" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                    <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                    <div className="fixed h-full  inset-0  z-30 w-screen overflow-y-auto">
                        <div className="flex min-h-full h-full w-full items-center justify-center p-4 text-center sm:items-center sm:p-0">

                            <div className="relative lg:min-w-96 w-full sm:w-1/3  transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8">

                                {/* Header  */}
                                <div className="border-b  rounded-t-lg bg-gray-50 flex justify-between px-5 py-4">

                                    <div className='flex items-center space-x-3'>
                                        {/* <img src={Alert} className="w-12 h-12" /> */}
                                        <h3 className="font-bold text-xl text-gray-900" id="modal-title">Confirm</h3>
                                    </div>
                                    {/* <button onClick={() => { setRowToDelete(null); setShowDeleteModal(false) }}><XMarkIcon className="w-6 h-6" /></button> */}
                                </div>

                                {/* Body  */}
                                <div className="h-5/6 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">

                                    <div className="sm:flex sm:items-start h-5/6 ">
                                        <div className="mt-3 text-center  h-full w-full sm:ml-4 sm:mt-0 sm:text-left">
                
                                            <div className="col-span-full ">
                                                {console.log(IsLastTest)}
                                                {IsLastTest ?(
                                                    <>
                                                    
                                                    <label htmlFor="TestCompletion" className="block text-sm font-medium leading-6 text-gray-900">Test Has Been Completed The Recruiter Will Contact You</label>
                                                    
                                                    </>

                                                ):(
                                                    <>
                                                    
                                                    <label htmlFor="TestCompletion" className="block text-sm font-medium leading-6 text-gray-900 text-center ">Next Test</label>
                                                   
                                                    </>
                                                    
                                                )}
                                                    {/* <label htmlFor="TestCompletion" className="block text-sm font-medium leading-6 text-gray-900">Test Has Been Completed The Recruiter Will Contact You</label> */}
                                                <div className="mb-5 min-w-fit text-center">
                                                    <button type="button" onClick={NextTest}  className="h-10 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm  sm:ml-3 sm:w-auto mt-5">Okay</button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                                {/* Footer  */}
                                <div className="bg-gray-50  rounded-b-lg ms-auto px-4 py-3 flex justify-end items-center sm:px-6 space-x-3">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
                
        </>
    );
  
}
export default CandidateInterface;