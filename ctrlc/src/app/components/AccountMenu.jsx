import { useState, useRef, useEffect } from "react";
import Link from "next/link";
const AccountMenu = ( { id } ) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Icon */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#ffffff"
        >
          <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border p-2 text-black">
            <Link href={`/mt5account/${id}`}>                                    {/* href={`/mt5acccout/${strategy.name}`} */}

            <button className="w-full text-left px-3 py-2 hover:bg-gray-100 flex" onClick={() =>  setIsOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m296-80-56-56 276-277 140 140 207-207 57 57-264 263-140-140L296-80Zm-136-40q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h560q33 0 56.5 23.5T800-760v168H160v472Zm0-552h560v-88H160v88Zm0 0v-88 88Z"/></svg>
                  View Stats
            </button>
            </Link>
        
          {/* <button className="w-full text-left px-3 py-2  hover:bg-gray-100 flex"  onClick={() => { setIsOpen(false); alert("Delete Account");  }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
              Delete
          </button> */}
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
