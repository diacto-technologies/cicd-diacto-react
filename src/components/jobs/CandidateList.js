import React, { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useParams } from "react-router-dom";
import { api } from "../../constants/constants";

const CandidateList = ({ selectedStage, viewMode }) => {
  const { authTokens, userDetails, user } = useContext(AuthContext);
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      setCandidates([]);
      setPage(1);
      console.log("1",selectedStage,viewMode);

      fetchCandidates(1);
    }
  }, [selectedStage,viewMode]);

  useEffect(() => {
    
    if ( page && page > 1) {
      console.log("2");
      fetchCandidates(page);
    }
  }, [page]);

  // Observer for detecting when the user scrolls near the bottom
  useEffect(() => {
    if (!hasMore || loading) return;

    const handleObserver = (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 1.0,
    });

    const currentObserver = observerRef.current;
    const lastElement = document.querySelector("#infinite-scroll-target");

    if (lastElement) {
      currentObserver.observe(lastElement);
    }

    return () => {
      if (lastElement) currentObserver.unobserve(lastElement);
    };
  }, [hasMore, loading]);

  // const fetchCandidates = async (page) => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `/candidates/list-with-stages/?stage_name=${selectedStage}&job_id=${jobId}${
  //         page > 1 ? `&page=${page}` : ""
  //       }`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Bearer " + String(authTokens.access),
  //         },
  //       }
  //     );
  //     const data = await response.json();

  //     const formattedData = [];

  //     if (data.results && data.results.length) {
  //       data.results.forEach((candidate) => {
  //         const existingStages = [
  //           {
  //             key: "application-received",
  //             name: "Application Received",
  //             completed: true,
  //             status_text: "Completed",
  //             updated_at: candidate.created_at
  //               ? new Date(candidate.created_at).toLocaleString("en-US", {
  //                   weekday: "short", // Abbreviated day of the week (e.g., Wed)
  //                   day: "2-digit", // Two-digit day (e.g., 20)
  //                   month: "long", // Full month name (e.g., June)
  //                   year: "numeric", // Four-digit year (e.g., 2024)
  //                   hour: "2-digit", // Two-digit hour (e.g., 12)
  //                   minute: "2-digit", // Two-digit minute (e.g., 24)
  //                   hour12: true, // 12-hour format with am/pm
  //                 })
  //               : null,
  //           },
  //         ];
  //         Object.keys(candidate["stages"]).forEach((key) => {
  //           const item = candidate["stages"][key];
  //           console.log(candidate.name, candidate["stages"], key, item);
  //           if (item && item["exists"] == true) {
  //             existingStages.push({
  //               id: item["details"]["id"],
  //               key: item["key"],
  //               name: item["stage_name"],
  //               completed: item["details"]["completed"] || false,
  //               is_approved: item["details"]["is_approved"] || false,
  //               approved_by: item["details"]["approved_by"] || false,
  //               updated_by: item["details"]["updated_by"] || false,
  //               updated_at: item.details?.updated_at
  //                 ? new Date(item.details.updated_at).toLocaleString("en-US", {
  //                     weekday: "short", // Abbreviated day of the week (e.g., Wed)
  //                     day: "2-digit", // Two-digit day (e.g., 20)
  //                     month: "long", // Full month name (e.g., June)
  //                     year: "numeric", // Four-digit year (e.g., 2024)
  //                     hour: "2-digit", // Two-digit hour (e.g., 12)
  //                     minute: "2-digit", // Two-digit minute (e.g., 24)
  //                     hour12: true, // 12-hour format with am/pm
  //                   })
  //                 : null,
  //               status_text: item["details"]["status_text"] || "",
  //             });
  //           }
  //         });

  //         const hiredStage = {
  //           key: "hired",
  //           name: "Hired",
  //           completed: true,
  //           approved: true,
  //           hired: true,
  //           status_text: "Hired",
  //           updated_at: candidate.updated_at
  //             ? new Date(candidate.updated_at).toLocaleString("en-US", {
  //                 weekday: "short", // Abbreviated day of the week (e.g., Wed)
  //                 day: "2-digit", // Two-digit day (e.g., 20)
  //                 month: "long", // Full month name (e.g., June)
  //                 year: "numeric", // Four-digit year (e.g., 2024)
  //                 hour: "2-digit", // Two-digit hour (e.g., 12)
  //                 minute: "2-digit", // Two-digit minute (e.g., 24)
  //                 hour12: true, // 12-hour format with am/pm
  //               })
  //             : null,
  //         };

  //         candidate.stages = [...existingStages];
  //         formattedData.push(candidate);
  //       });

  //       setCandidates((prev) => [...prev, ...formattedData]);
  //       setHasMore(data.next);
  //     }

  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Failed to fetch candidates:", error);
  //     setLoading(false);
  //   }
  // };


  const fetchCandidates = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${api}/candidates/list-with-stages/?stage_name=${selectedStage}&job_id=${jobId}${
          page > 1 ? `&page=${page}` : ""
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const formattedData = [];
      console.log(data.results);
      if (data.results && data.results.length) {
        // [Process data as before]
        data.results.forEach((candidate) => {
          const existingStages = [
            {
              key: "application-received",
              name: "Application Received",
              completed: true,
              status_text: "Completed",
              updated_at: candidate.created_at
                ? new Date(candidate.created_at).toLocaleString("en-US", {
                    weekday: "short", // Abbreviated day of the week (e.g., Wed)
                    day: "2-digit", // Two-digit day (e.g., 20)
                    month: "long", // Full month name (e.g., June)
                    year: "numeric", // Four-digit year (e.g., 2024)
                    hour: "2-digit", // Two-digit hour (e.g., 12)
                    minute: "2-digit", // Two-digit minute (e.g., 24)
                    hour12: true, // 12-hour format with am/pm
                  })
                : null,
            },
          ];
          Object.keys(candidate["stages"]).forEach((key) => {
            const item = candidate["stages"][key];
            if (item && item["exists"] == true) {
              existingStages.push({
                id: item["details"]["id"],
                key: item["key"],
                name: item["stage_name"],
                completed: item["details"]["completed"] || false,
                is_approved: item["details"]["is_approved"] || false,
                approved_by: item["details"]["approved_by"] || false,
                updated_by: item["details"]["updated_by"] || false,
                updated_at: item.details?.updated_at
                  ? new Date(item.details.updated_at).toLocaleString("en-US", {
                      weekday: "short", // Abbreviated day of the week (e.g., Wed)
                      day: "2-digit", // Two-digit day (e.g., 20)
                      month: "long", // Full month name (e.g., June)
                      year: "numeric", // Four-digit year (e.g., 2024)
                      hour: "2-digit", // Two-digit hour (e.g., 12)
                      minute: "2-digit", // Two-digit minute (e.g., 24)
                      hour12: true, // 12-hour format with am/pm
                    })
                  : null,
                status_text: item["details"]["status_text"] || "",
              });
            }
          });

          const hiredStage = {
            key: "hired",
            name: "Hired",
            completed: true,
            approved: true,
            hired: true,
            status_text: "Hired",
            updated_at: candidate.updated_at
              ? new Date(candidate.updated_at).toLocaleString("en-US", {
                  weekday: "short", // Abbreviated day of the week (e.g., Wed)
                  day: "2-digit", // Two-digit day (e.g., 20)
                  month: "long", // Full month name (e.g., June)
                  year: "numeric", // Four-digit year (e.g., 2024)
                  hour: "2-digit", // Two-digit hour (e.g., 12)
                  minute: "2-digit", // Two-digit minute (e.g., 24)
                  hour12: true, // 12-hour format with am/pm
                })
              : null,
          };

          candidate.stages = [...existingStages];
          formattedData.push(candidate);
        });

        setCandidates((prev) => [...prev, ...formattedData]);
        setHasMore(data.next ? true : false); // Ensure it's a boolean
        
      setLoading(false);
      } else {
        setHasMore(false); // No more data available
        
      setLoading(false);
      }

    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      setLoading(false);
      setHasMore(false); // Prevent further fetch attempts
    }
  };

  return (
    <div className="w-full mt-5 p-4 rounded-md border">
      {candidates?.map((candidate, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-white border-b p-3"
        >
          {/* Avatar Section */}
          <div className="flex items-center space-x-4 w-1/5">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
              {candidate.avatar || candidate.name[0]}
            </div>
            <div className="text-sm font-medium">
              <label>{candidate.name}</label>
              <p className="text-xs text-gray-500 font-normal">
                {candidate.email}
              </p>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="flex-1 px-6">
            <ol className="flex items-center w-full p-3 space-x-2 text-sm font-medium text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm sm:text-base  sm:p-4 sm:space-x-4 rtl:space-x-reverse">
              {candidate?.stages?.map((stage, idx) => (
                <li
                  key={idx}
                  className={` relative group flex items-center  cursor-default text-sm`}
                >
                  {/* Tooltip */}
                  <div className="absolute w-96 -top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/4 hidden group-hover:flex flex-col p-4 rounded-lg bg-white shadow-lg border border-gray-200 z-10">
                    {/* Recruiter Info */}
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold">
                        {stage?.updated_by?.name?.[0] || "N/A"}
                      </div>
                      <div className="ml-3  text-start">
                        <p className="text-sm font-semibold text-gray-700">
                          {stage?.updated_by?.name || "Name not available"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Updated: {stage?.updated_at || "Not updated yet"}
                        </p>
                      </div>
                    </div>

                    {/* Status Info */}
                    <div>
                      <p className="text-sm text-gray-600 bg-gray-100/60 rounded-md p-2 ">
                        <span className="font-medium">Status:</span>{" "}
                        {stage?.status_text || "Not available"}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Indicator */}
                  <span
                    class={`
                    flex items-center justify-center w-5 h-5 me-2 text-xs border border-gray-500 rounded-full shrink-0 dark:border-gray-400
                     ${
                       stage.status_text === "Completed" &&
                       "bg-teal-500 text-white"
                     }
                      ${
                        stage.status_text === "Under Review" &&
                        "bg-yellow-500 text-white"
                      }
                      ${
                        stage.status_text === "On Hold" &&
                        "bg-orange-500 text-white"
                      }
                      ${
                        stage.status_text === "Not Shortlisted" &&
                        "bg-red-500 text-white"
                      }
                      ${
                        stage.status_text === "Shortlisted" &&
                        "bg-blue-500 text-white"
                      }
                      ${
                        stage.status_text === "Failed to Process" &&
                        "bg-red-500 text-white"
                      }
                    `}
                  >
                    {stage.status_text === "Failed to Process" ? (
                      <i class="fa-solid fa-exclamation"></i>
                    ) : (
                      idx + 1
                    )}
                  </span>
                  {stage.name}
                  {/* <span class="hidden sm:inline-flex sm:ms-2">Info</span> */}
                  <svg
                    class="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 12 10"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m7 9 4-4-4-4M1 9l4-4-4-4"
                    />
                  </svg>
                </li>
              ))}
            </ol>
          </div>

          {/* Actions Section */}
          {/* <div className="relative w-[5rem] flex items-center justify-center">
            <button className="text-gray-500 hover:text-gray-700">
              <EllipsisHorizontalIcon className="w-6 h-6 font-bold" />
            </button>
          </div> */}
        </div>
      ))}
      {/* Infinite Scroll Target */}
      {hasMore && (
        <div
          id="infinite-scroll-target"
          className="w-full h-10 flex justify-center items-center text-gray-500"
        >
          {loading ? "Loading more..." : "Scroll to load more"}
        </div>
      )}
    </div>
  );
};

// Example candidate data
export default CandidateList;
