import ServiceMenu from "./ServiceMenu";

const MiniCard = ({ item, id, current }) => {
  return (
    <>
      <div
        key={item.id}
        id={id ? id : item.id}
        className={`module p-3 pt-4 flex w-72 h-24 items-center justify-between rounded-lg bg-white shadow-md hover:ring ring-indigo-500 ${
          current && "ring ring-indigo-500"
        }`}
      >
        <div className="w-auto text-center flex  justify-center items-center gap-2">
          <img className="w-14 h-14 p-2 border rounded-md" src={item?.icon} />
          <label className="text-[.8rem] font-medium w-full text-center text-gray-700">
            {item?.label}
          </label>
        </div>
        <ServiceMenu />
      </div>
    </>
  );
};

export default MiniCard;
