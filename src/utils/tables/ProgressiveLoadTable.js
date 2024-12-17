import { useContext, useEffect, useState } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import "tabulator-tables/dist/css/tabulator.min.css";
import './Table.css'
import AuthContext from '../../context/AuthContext';

const ProgressiveLoadTable = ({ setTableInstance,data ,columns , url,}) => {
    // console.log(tableData.length)
    var table = {}
    const { authTokens  } = useContext(AuthContext);

    const pageSize= 10;


    useEffect(() => {
        console.count("Table render count") 

        table = new Tabulator("#custom-table", {
            height: '100%', // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            // data: data, //assign data to table
            columns:columns,
            layout: "fitColumns", //fit columns to width of table (optional)
            paginationSize:pageSize,
            progressiveLoad:"scroll",
            // progressiveLoadScrollMargin:50, //trigger next ajax load when scroll bar is 300px or less from the bottom of the table.
            ajaxURL: url, 
            ajaxConfig:{
                method:"GET", //set request type to Position
                headers: {
                    "Content-type": 'application/json; charset=utf-8', //set specific content type
                    Authorization: "Bearer " + String(authTokens.access),
                },
            },
            ajaxResponse: function(url, params, response) {
                // Extract the total number of records from the response
                var totalRecords = response.count; // Assuming the response contains the total number of records
                
                // Calculate the last page based on the total number of records and pagination size
                var lastPage = Math.ceil(totalRecords / pageSize);
                
                // Return the modified response object with the calculated last page
                return {
                    last_page: lastPage, // Add the calculated last page to the response
                    data: response.results, // Return the original data
                    next: response.next, // Add next page URL to the response
                    previous: response.previous // Add previous page URL to the response
                };
            },
            dataReceiveParams:{
                "data":"results", //change last_page parameter name to "max_pages"
                "last_row" : "count"
            } ,
            selectableRows:true,
            headerFiltering: true, // Enable header filtering
            headerFilterPlaceholder: "Filter...",
            headerFilterLiveFilter: false,
            // responsiveLayout: true,
           

            ajaxURLGenerator:function(url, config, params,response){
                //url - the url from the ajaxURL property or setData function
                //config - the request config object from the ajaxConfig property
                //params - the params object from the ajaxParams property, this will also include any pagination, filter and sorting properties based on table setup
                const pageNumber = params.page || 2;
                const endpointURL = params.page === 1 ? url : url + "?page=" + pageNumber;
                console.log(endpointURL,params.page)
                return endpointURL; //encode parameters as a json object
            },

        });

        setTableInstance(table)

        return () => {
            // Destroy the table when the component unmounts
            table.destroy();
          };

    }, [])



    var headerMenu = function () {
        var menu = [];
        var columns = this.getColumns();

        for (let column of columns) {

            //create checkbox element using font awesome icons
            let icon = document.createElement("i");
            icon.classList.add("fas");
            icon.classList.add(column.isVisible() ? "fa-check-square" : "fa-square");

            //build label
            let label = document.createElement("span");
            let title = document.createElement("span");

            title.textContent = " " + column.getDefinition().title;

            label.appendChild(icon);
            label.appendChild(title);

            //create menu item
            menu.push({
                label: label,
                action: function (e, column) {
                    // Show the filter input field when the "Filter" menu item is clicked
                    column.setHeaderFilterFocus();
                },
                // action: function (e) {
                //     //prevent menu closing
                //     e.stopPropagation();

                //     //toggle current column visibility
                //     column.toggle();

                //     //change menu item icon
                //     if (column.isVisible()) {
                //         icon.classList.remove("fa-square");
                //         icon.classList.add("fa-check-square");
                //     } else {
                //         icon.classList.remove("fa-check-square");
                //         icon.classList.add("fa-square");
                //     }
                // }
            });
        }

        return menu;
    };

    // ----------------------------------
    //Define variables for input elements
    var fieldEl = document.getElementById("filter-field");
    var typeEl = document.getElementById("filter-type");
    var valueEl = document.getElementById("filter-value");

    //Custom filter example
    function customFilter(data) {
        return data.car && data.rating < 3;
    }

    //Trigger setFilter function with correct parameters
    function updateFilter() {
        var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
        var typeVal = typeEl.options[typeEl.selectedIndex].value;

        var filter = filterVal == "function" ? customFilter : filterVal;

        if (filterVal == "function") {
            typeEl.disabled = true;
            valueEl.disabled = true;
        } else {
            typeEl.disabled = false;
            valueEl.disabled = false;
        }

        if (filterVal) {
            table.setFilter(filter, typeVal, valueEl.value);
        }
    }

    function isValidDate(dateString) {
        const parsedDate = Date.parse(dateString);
        return !isNaN(parsedDate);
    }

    const dynamicColumns = (data) => {
        console.log(data)
        const dataFields = Object.keys(data[0]);
        let columns = []
        data.map((row, index) => {
            dataFields.forEach((key) => {
                // console.log(typeof row[key], row[key])
                if (typeof row[key] === "number" || !isNaN(row[key])) {
                    const keyExists = columns.some(obj => obj.field === key);
                    if (!keyExists) {
                        const column = {
                            title: key, field: key, sorter: "number", hozAlign: "left", width: "20%",
                            
                            titleFormatter: function (cell, formatterParams, onRendered) {
                                return '<div class="column-container">' +
                                    `<label class="column-title">${key}</label>` +
                                    '<label class="column-data-type">Integer</label>' +
                                    '</div>';
                            },
                            headerPopup:headerPopupFormatter, headerPopupIcon:`<i class='fa-solid fa-filter column-filter-icon' title='Filter ${key}'></i>`, headerFilter:emptyHeaderFilter, headerFilterFunc:"like"
                        }
                        columns.push(column)
                    }
                }
                else if (isValidDate(row[key])) {
                    const keyExists = columns.some(obj => obj.field === key);
                    if (!keyExists) {
                        const column = {
                            title: key, field: key, sorter: "date", hozAlign: "left", width: "20%", editable: true,
                            sorterParams: {
                                format: "yyyy-MM-dd",
                                alignEmptyValues: "top",
                            },
                            titleFormatter: function (cell, formatterParams, onRendered) {
                                // console.log(cell, formatterParams)
                                return '<div class="column-container">' +
                                    `<label class="column-title">${key}</label>` +
                                    '<label class="column-data-type">Date</label>' +
                                    '</div>';
                            },
                            headerPopup:headerPopupFormatter, headerPopupIcon:`<i class='fa-solid fa-filter column-filter-icon' title='Filter ${key}'></i>`, headerFilter:emptyHeaderFilter, headerFilterFunc:"like"
                        }
                        columns.push(column)
                    }
                }
                else if (typeof row[key] === "string") {
                    const keyExists = columns.some(obj => obj.field === key);
                    if (!keyExists) {
                        const column = {
                            title: key, field: key, width: "20%", sorter: "string", 
                            titleFormatter: function (cell, formatterParams, onRendered) {

                                return '<div class="column-container">' +
                                    `<label class="column-title">${key}</label>` +
                                    '<label class="column-data-type">Integer</label>' +
                                    '</div>';
                            },
                            headerPopup:headerPopupFormatter, headerPopupIcon:`<i class='fa-solid fa-filter column-filter-icon' title='Filter ${key}'></i>`, headerFilter:emptyHeaderFilter, headerFilterFunc:"like"
                        }
                        columns.push(column)
                    }
                }
                else { console.log("undefined data type", row[key]) }
            })
        })
        return columns
    }

    var headerPopupFormatter = function(e, column, onRendered){
        var container = document.createElement("div");
        console.log(column._column.field)
        container.classList.add("column-filter")
        // var label = document.createElement("label");
        // label.style.display = "block";
        // label.style.fontSize = ".7em";
    
        var input = document.createElement("input");
        input.placeholder =`Filter...`;
        input.value = column.getHeaderFilterValue() || "";
    
        input.addEventListener("keyup", (e) => {
            column.setHeaderFilterValue(input.value);
        });
    
        //container.appendChild(label);
        container.appendChild(input);
    
        return container;
    }

    //create dummy header filter to allow popup to filter
    var emptyHeaderFilter = function(){
        return document.createElement("div");;
    }


    //Update filters on value change
    // document.getElementById("filter-field").addEventListener("change", updateFilter);
    // document.getElementById("filter-type").addEventListener("change", updateFilter);
    // document.getElementById("filter-value").addEventListener("keyup", updateFilter);

    //Clear filters on "Clear Filters" button click
    // document.getElementById("filter-clear").addEventListener("click", function () {
    //     fieldEl.value = "";
    //     typeEl.value = "=";
    //     valueEl.value = "";

    //     table.clearFilter();
    // });

    // ----------------------------------


    return (
        <>
            <div id="custom-table" className=""></div>
        </>
    );
}

export default ProgressiveLoadTable;