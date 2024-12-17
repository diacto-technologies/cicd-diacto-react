import { useContext, useEffect, useState } from "react";
import AuthContext from "../../../context/AuthContext";
import { api, selectStyle, selectTheme } from "../../../constants/constants";
import Select, { components } from "react-select";


function TeamMemberForm({ formSteps, currentStep, setCurrentStep, navigateToStep, jobId }) {
  const {
    authTokens,
    user,
    userDetails,
    domain,
  } = useContext(AuthContext);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [membersData, setMembersData] = useState([])
  const [selectedMembersData, setSelectedMembersData] = useState([])
  const [jobDetail, setJobDetail] = useState([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    // if(formData.id) 
    if (userDetails) {
      fetchUsers();
    }
    fetchJob(jobId);
  }, [userDetails])

  async function fetchUsers() {
    // console.log("Fetching users", userDetails);
    try {
      //   setUsersLoading(true);
      const response = await fetch(
        `${api}/accounts/organizations/${userDetails?.org?.org_id}/users/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
        }
      );

      if (!response.ok) {
        // setUsersLoading(false);
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      //// console.log("Users data: ", data);
      const formattedData = data.results.map((member) => {
        return {
          ...member,
          value: member.id,
          label: member.name
        }
      })
      setMembersData(formattedData);

      //   const usersSharedWithIds = job.users_shared_with;


      //   setUsersLoading(false);
      return { usersData: data.results };
    } catch (error) {
      console.error(error);
      //   setError(error.message);
      //   setUsersLoading(false);
    }
  };

  const fetchJob = async (jobId) => {
    //console.log("fetching dataset")
    setLoading(true)
    try {
      const response = await fetch(`${api}/jobs/job/${jobId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
        });
      if (!response.ok) {
        setLoading(false)
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setJobDetail(data);

      setSelectedMembersData(data?.users_shared_with?.map((member) => {
        return {
          ...member,
          value: member?.id,
          label: member?.name
        }
      }))

      setLoading(false)

      // getListData(data)

    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMembersOnchange = (selectedOption) => {
    //console.log("Selected Option: ", selectedOption, membersData)
    const selectedMembers = selectedOption.map((member) => {
      return membersData?.find(optionMember => optionMember.id === member.value)
    })
    //console.log(selectedMembers)

    setSelectedMembersData(selectedMembers)
  }

  const removemember = (id) => {
    setSelectedMembersData((prev) => {
      //console.log(prev)
      return prev.filter((member) => member.id !== id) || []
    })
    handleShareJob(id);
  }

  // called by share button is clicked
  const handleShareJob = async (id) => {
    //console.log(selectedMembersData)
    setDisabled(true)
    let formattedData
    if (id) {
      let validMembers = selectedMembersData.filter(member => member.id !== id)
      formattedData = `{"users_shared_with":[${validMembers.map((member) => member.id)}]}`
    }
    else {
      formattedData = `{"users_shared_with":[${selectedMembersData.map((member) => member.id)}]}`
    }
    try {
      const response = await fetch(`${api}/jobs/job/${jobId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
          body: formattedData
        });
      if (!response.ok) {
        setLoading(false)
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      //console.log(data)
      setDisabled(false)

      // setLoading(false)

      // getListData(data)

    } catch (error) {
      setDisabled(false)
      setError(error);
    }
  };

  const Option = (props) => {
    return (
      <components.Option {...props}>
        <div>{props.data.label}</div>
        <div className="" style={{ fontSize: ".65rem", color: "" }}>
          {props.data.email}
        </div>
      </components.Option>
    );
  };

  //console.log(selectedMembersData)

  return (
    <>
      <div className="w-[70rem] bg-white min-h-80 mx-auto rounded-md shadow-sm">
        <div className="bg-[#e4e5f9] px-16 py-6 rounded-t-md">
          <h1 className="text-xl">Team Member</h1>
        </div>
        {!loading ? <div className="px-16 py-6">
          <div className='bg-gray-100 px-12 py-8 rounded-md mt-8 flex flex-row gap-24'>
            <div className="max-w-[350px]">
              <h2 className='font-semibold'>Add other members</h2>
              <p className='text-sm text-gray-500 mt-2'>You can add team members or invite others to collaborate on this job.</p>
            </div>
            <div className="flex-grow">
              <h1>Select Members</h1>
              <div className="flex flex-row gap-6 mt-3">
                {/* <input type="text" className="w-72 border rounded-md"></input> */}
                <Select
                  className="text-sm md:w-full min-w-fit"
                  styles={selectStyle}
                  theme={selectTheme}
                  value={selectedMembersData || []}
                  onChange={handleMembersOnchange}
                  isMulti
                  options={membersData}
                  components={{ Option }}
                  placeholder="Select a member..."
                />
                {/* <button className="bg-[#7076f2] text-white px-4 py-2 rounded-md w-60">Add to team</button> */}
              </div>
            </div>
          </div>

          <div>
            {selectedMembersData?.map((member) => {
              return (
                <div className="flex flex-row justify-between px-12 py-6 border-b">
                  <div className="flex gap-4">
                    <img src={member.profile_pic} className="w-12 h-12 rounded-full"></img>

                    <div className="w-60">
                      <p className="font-medium">
                        {member.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <span className="self-center text-slate-500 text-sm font-medium">
                    {member.role?.name}
                  </span>

                  <i className="fa-solid fa-trash self-center text-[#7076f2] cursor-pointer" onClick={() => removemember(member.id)}></i>
                </div>
              )
            })}
            {/* <div className="flex flex-row justify-between px-12 py-6 border-b">
              <div className="flex gap-4">
                <img src="https://candidhr-bucket.s3.amazonaws.com/user_profile_pics/pp1_Ra4IUE5.jpg?AWSAccessKeyId=AKIAQO5H23OLTTXCSUIS&Signature=Ie1p4kaJL2k1QY%2B2tBqw3Fti03g%3D&Expires=1731335394" className="w-12 h-12 rounded-full"></img>

                <div className="">
                  <p className="font-medium">
                    Chirag Rakh
                  </p>
                  <p className="text-sm text-gray-500">
                    chirag@gmail.com
                  </p>
                </div>
              </div>

              <span className="self-center">
                Admin
              </span>

              <i class="fa-solid fa-trash self-center text-red-600"></i>
            </div> */}
          </div>
        </div> :
          <h2 className='px-16 py-6 h-72 flex items-center justify-center'>Loading....</h2>}

        <div className="px-16 py-6 flex justify-end gap-3">
          {currentStep !== 1 && <button onClick={() => navigateToStep(currentStep - 1)} className="border rounded-md px-6 py-2">Back</button>}
          {/* {currentStep !== formSteps.length && <button onClick={() => navigateToStep(currentStep + 1)} className="border rounded-md px-6 py-2">Next</button>} */}
          {currentStep !== formSteps.length && <button onClick={handleShareJob} className="border bg-brand-purple text-white rounded-md px-6 py-2" disabled={disabled}>Share</button>}
        </div>
      </div>
    </>
  );
}

export default TeamMemberForm;