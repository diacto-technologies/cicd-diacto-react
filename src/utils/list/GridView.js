import AssessmentCard from "../cards/AssessmentCard";

const GridView = ({ items,editable }) => {
  console.log(items);



  return (
    <>
      <div className="w-full h-full flex items-start justify-start flex-wrap gap-5 overflow-auto px-3 py-4">
        {items?.length > 0 &&
          items.map((item, index) => (
            <AssessmentCard item={item} editable={editable}  />
          ))}
      </div>
    </>
  );
};

export default GridView;
