import { useContext, useEffect } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import "tabulator-tables/dist/css/tabulator.min.css";
import './Table.css'
import AuthContext from '../../context/AuthContext';

const Table = ({ setTableInstance, data, columns, url, fieldMapping, setTableRowCount }) => {
    var table = {}
    const { authTokens } = useContext(AuthContext);
    const pageSize = 30;
    const operatorMapping = {
        equals: 'in',  // AG Grid 'equals' becomes Django 'iexact'
        contains: 'icontains',  // AG Grid 'contains' becomes Django 'icontains'
        like: 'icontains',  // tabulator 'like' becomes Django 'icontains'
        startsWith: 'istartswith',  // AG Grid 'startsWith' becomes Django 'istartswith'
        endsWith: 'iendswith',  // AG Grid 'endsWith' becomes Django 'iendswith'
        greaterThan: 'gt',  // AG Grid 'greaterThan' becomes Django 'gt'
        lessThan: 'lt',  // AG Grid 'lessThan' becomes Django 'lt'
        greaterThanOrEqual: 'gte',  // AG Grid 'greaterThan' becomes Django 'gt'
        lessThanOrEqual: 'lte',  // AG Grid 'lessThan' becomes Django 'lt'
        inRange: 'range',
        in: "in",    //autotable
        // "=": "",    //ignore the operator
        "!=": "iexact"       //tabulator mapping
        // Add more mappings as needed...
    };
    useEffect(() => {

        table = new Tabulator("#custom-table", {
            height: '100%', // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            // data: data, //assign data to table
            columns: columns,
            layout: "fitColumns", //fit columns to width of table (optional)
            paginationSize: pageSize,
            progressiveLoad: "scroll",
            // progressiveLoadScrollMargin:50, //trigger next ajax load when scroll bar is 300px or less from the bottom of the table.
            ajaxSorting: true,      // Enable server-side sorting
            ajaxURL: url,
            ajaxConfig: {
                method: "GET", //set request type to Position
                headers: {
                    "Content-type": 'application/json; charset=utf-8', //set specific content type
                    Authorization: "Bearer " + String(authTokens.access),
                },
            },
            ajaxResponse: function (url, params, response) {
                setTableRowCount(response.count)
                // Extract the total number of records from the response
                var totalRecords = response.count; // Assuming the response contains the total number of records
                // Calculate the last page based on the total number of records and pagination size
                var lastPage = Math.ceil(totalRecords / pageSize);
                // Return the modified response object with the calculated last page
                return {
                    last_page: lastPage, // Add the calculated last page to the response
                    data: response.results, // Return the original data
                    next_page_url: response.next, // Add next page URL to the response
                    prev_page_url: response.previous // Add previous page URL to the response
                };
            },
            dataReceiveParams: {
                "data": "results", //change last_page parameter name to "max_pages"
                "last_row": "count",
            },
            selectableRows: true,
            headerFiltering: true, // Enable header filtering
            headerFilterPlaceholder: "Filter...",
            headerFilterLiveFilter: false,
            filterMode: "remote",
            sortMode: "remote", //send sort data to the server instead of processing locally
            // responsiveLayout: true,


            ajaxURLGenerator: function (url, config, params, data) {
                //url - the url from the ajaxURL property or setData function
                //config - the request config object from the ajaxConfig property
                //params - the params object from the ajaxParams property, this will also include any pagination, filter and sorting properties based on table setup
                const pageNumber = params.page || 2;
                let endpointURL = params.page === 1 ? url : url + "?page=" + pageNumber;
                //console.log("Urls: ", url, "config: ", config, "params: ", params, "data: ", data)

                // Loop through the filter parameters if available
                if (params?.filter && params?.filter?.length > 0) {
                    const newQuery = buildQueryParams(params?.filter, []);
                    //console.log(newQuery);
                    endpointURL += params.page === 1 ? `?${newQuery}` : `&${newQuery}`;
                    if (params?.sort && params?.sort?.length > 0) {
                        const field = fieldMapping && fieldMapping[params.sort[0].field] ? fieldMapping[params.sort[0].field] : params.sort[0].field;
                        const dir = params.sort[0].dir;
                        endpointURL += `&o=${dir === "asc" ? field : '-' + field}`;
                    }
                }
                else {
                    if (params?.sort && params?.sort?.length > 0) {
                        const field = fieldMapping && fieldMapping[params.sort[0].field] ? fieldMapping[params.sort[0].field] : params.sort[0].field;
                        const dir = params.sort[0].dir;
                        endpointURL += `${params.page === 1?"?":"&"}o=${dir === "asc" ? field : '-' + field}`;
                    }
                }
                return endpointURL; //encode parameters as a json object
            },

        });

        setTableInstance(table)

        return () => {
            // Destroy the table when the component unmounts
            table.destroy();
        };

    }, [])

    const buildQueryParams = (filters, sortModel) => {
        //console.log(filters)
        let queryParams = '';

        filters.forEach((filter) => {
            const field = fieldMapping && fieldMapping[filter.field] ? fieldMapping[filter.field] : filter.field;
            const value = filter.value;
            const type = filter.type;
            
            queryParams += field + "__" + operatorMapping[type] + "=" + value + "&";
        })

        return queryParams.slice(0, -1);  // Remove trailing '&'
    };



    return (
        <>
            <div id="custom-table" className=""></div>
        </>
    );
}

export default Table;

