import { useState } from "react";

const Menu = (props) => {
    const [menuOpen, setMenuOpen] = useState(false);
  
    const toggleMenu = () => {
      setMenuOpen(!menuOpen);
    };
  
    const handleEdit = () => {
      console.log("Edit action for:", props.data);
      setMenuOpen(false);
    };
  
    const handleDelete = () => {
      console.log("Delete action for:", props.data);
      setMenuOpen(false);
    };
  
    return (
      <div style={{ position: 'relative' }}>
        <button onClick={toggleMenu} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px' }}>⋮</span>
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '0px',
            backgroundColor: 'white',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            padding: '10px',
            borderRadius: '4px'
          }}>
            <div onClick={handleEdit} style={{ padding: '5px', cursor: 'pointer' }}>Edit</div>
            <div onClick={handleDelete} style={{ padding: '5px', cursor: 'pointer' }}>Delete</div>
          </div>
        )}
      </div>
    );
  };


export default Menu;