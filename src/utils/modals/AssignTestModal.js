import { XMarkIcon } from "@heroicons/react/20/solid";

const AssignTestModal = ({onClose}) => {


    return ( 
        <>
        <div
          className="relative  z-30"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed h-full  inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <div
                style={{ minWidth: "55%" }}
                className="relative  h-1/2 transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8"
              >
                {/* Header  */}
                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">
                  <h3
                    className="text-base p-4 font-semibold leading-6 text-gray-900"
                    id="modal-title"
                  >
                    Assign an Assessment
                  </h3>
                  <button onClick={() => handleClose()}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Body  */}
                <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="p-4 md:p-5">
                    <form
                      id="create-test-form"
                      class="space-y-4"
                      onSubmit={ShareTest}
                    >
                    
                      {/* <div>
                        <label
                          htmlFor="candidates"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Candidates
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Select candidate to share"
                          isMulti
                          isDisabled={!selectedJob}
                          isLoading={loadingApplicants}
                          value={CandidateSelected}
                          onChange={(selectedOption) =>
                            setCandidateSelected(selectedOption)
                          }
                          options={candidateOptions}
                          onInputChange={(value) => handleInputChange(value)}
                          styles={selectStyle}
                        />
                      </div> */}
                      <div>
                        <label
                          htmlFor="tests"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Tests
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Select test"
                          isMulti
                          value={TestSelected}
                          onChange={(selectedOption) =>
                            setTestSelected(selectedOption)
                          }
                          options={Testoptions}
                          styles={selectStyle}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="valid_from"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Valid From
                        </label>
                        <div className="mt-2">
                          <input
                            type="datetime-local"
                            name="valid_from"
                            id="valid_from"
                            value={validFrom}
                            min={currentDate}
                            onChange={handleValidFromChange}
                            autoComplete="valid_from"
                            className="block w-full md:w-1/2 rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="valid_to"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Valid To
                        </label>
                        <div className="mt-2">
                          <input
                            type="datetime-local"
                            name="valid_to"
                            id="valid_to"
                            min={currentDate}
                            value={validTo}
                            onChange={handleValidToChange}
                            autoComplete="valid_to"
                            className="block w-full md:w-1/2 rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      {/* <div class="flex justify-between">
                                                <div class="flex items-start">
                                                    <div class="flex items-center h-5">
                                                        <input id="redirectToTestCreation" type="checkbox" checked={redirectToTestCreation} onChange={() => setRedirectToTestCreation(!redirectToTestCreation)} class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" />
                                                    </div>
                                                    <label htmlFor="redirectToTestCreation" class="ms-2 text-sm font-medium text-gray-600 ">Redirect to Test Creation</label>
                                                </div> */}
                      {/* <a href="#" class="text-sm text-blue-700 hover:underline dark:text-blue-500">Lost Password?</a> */}
                      {/* </div> */}
                    </form>
                  </div>
                </div>

                {/* Footer  */}
                <div className="bg-gray-50 absolute bottom-0 right-0 w-full rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                  <button
                    disabled={assigningTest}
                    type="submit"
                    form="create-test-form"
                    className="h-10  justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto"
                  >
                    {assigningTest ? "Assigning" : "Send Assessment Link"}
                  </button>
                  <button
                    onClick={() => onClose()}
                    type="button"
                    className="h-10 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
     );
}
 
export default AssignTestModal;