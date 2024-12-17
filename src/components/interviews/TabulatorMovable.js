import { useEffect } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import "tabulator-tables/dist/css/tabulator.min.css";
// import '../../utils/tables/Table.css'


const TabulatorMovable = ({ data }) => {

    var table;

    useEffect(() => {
        console.count("Table render count")


        table = new Tabulator("#service-table", {
            height : 220,
            movableRows: true, //enable movable rows
            movableRowsConnectedElements: "#drop-element", //element to receive rows
            data: [{
                id: 1,
                name: "Resume"
            },
            {
                id: 1,
                name: "Personality"
            }, {
                id: 1,
                name: "Test"
            },
            {
                id: 1,
                name: "Interview"
            },
            ],
            columns: [
                { title: "Name", field: "name", width: '200px' },
            ],
        });

        table?.on("movableRowsElementDrop", function (e, element, row) {
            //e - mouseup event object
            //element - node object for the element that the row was dropped onto
            //row - row component for the row that was moved

            //add a li to the drop element containing the name property from the row data
            const listItem = document.createElement('li');
            listItem.className = 'min-w-0 flex-auto border rounded-2xl p-3';

            // Create the label element
            const label = document.createElement('label');
            label.className = 'mt-1 text-sm block font-normal text-gray-800';
            label.innerHTML = `<span class="me-2 font-medium">${row.getData().name}</span>`;

            // Append the label to the list item
            listItem.appendChild(label);

            element.appendChild(listItem);
        });

        // setTableInstance(table)

        return () => {
            // Destroy the table when the component unmounts
            table.destroy();
        };

    }, [])




    return (
        <> 
            <div className='flex justify-center w-full'>
                <div className='w-1/2 overflow-hidden' id="service-table"></div>
                <ul className='rounded-md w-1/2 p-3 space-y-3' id="drop-element"></ul>
            </div>
        </>
    );
}

export default TabulatorMovable;