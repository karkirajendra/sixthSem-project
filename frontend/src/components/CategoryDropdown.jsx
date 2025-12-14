import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FaHome, FaBuilding, FaDoorOpen, FaCity, FaChevronDown } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const categories = [
  {
    name: 'Houses',
    icon: <FaHome className="text-primary-500" />,
    type: 'house',
    description: 'Find your perfect family home in Nepal'
  },
  {
    name: 'Apartments',
    icon: <FaBuilding className="text-primary-500" />,
    type: 'apartment',
    description: 'Modern living in Nepali cities'
  },
  {
    name: 'Rooms',
    icon: <FaDoorOpen className="text-primary-500" />,
    type: 'room',
    description: 'Affordable shared living spaces'
  },
  {
    name: 'Flats',
    icon: <FaCity className="text-primary-500" />,
    type: 'flat',
    description: 'Comfortable urban living in Nepal'
  }
];

const CategoryDropdown = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (type) => {
    navigate(`/properties?type=${type}`);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
        <span>Categories</span>
        <FaChevronDown className="text-sm" />
      </Menu.Button>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-64 origin-top-left bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
          <div className="p-2">
            {categories.map((category) => (
              <Menu.Item key={category.name}>
                {({ active }) => (
                  <button
                    onClick={() => handleCategoryClick(category.type)}
                    className={`${
                      active ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                    } group flex items-center px-4 py-3 text-sm rounded-md transition-colors w-full text-left`}
                  >
                    <div className="flex-shrink-0 w-5 h-5 mr-3">
                      {category.icon}
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default CategoryDropdown;