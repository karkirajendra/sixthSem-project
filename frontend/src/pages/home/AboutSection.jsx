import { FaHome, FaHandshake, FaUserFriends, FaShieldAlt, FaHeart } from 'react-icons/fa';

const AboutSection = () => {
  const features = [
    {
      icon: <FaHome className="text-2xl" />,
      title: "Wide Selection",
      description: "Explore flats, apartments, and rooms to find your ideal place.",
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
    },
    {
      icon: <FaHandshake className="text-2xl" />,
      title: "Direct Communication",
      description: "Talk directly with owners or no middlemen involved.",
      color: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      icon: <FaUserFriends className="text-2xl" />,
      title: "Community Insights",
      description: "Understand neighborhoods and amenities before moving in.",
      color: "bg-gradient-to-br from-rose-500 to-pink-600",
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "Secure Process",
      description: "Verified listings and safe communication throughout your search.",
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
    }
  ];

  return (
    <div className="relative bg-white py-20 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-br from-indigo-50/30 to-purple-50/30 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-br from-teal-50/30 to-emerald-50/30 translate-x-1/2 translate-y-1/2 rounded-full" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 ">
          {/* <span className="inline-block bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent text-sm font-semibold px-4 py-2 rounded-full mb-6">
            Why Choose RoomSathi
          </span> */}
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-teal-100 rounded-full px-4 py-1 mb-4">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
              Why Choose RoomSathi
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Finding Your Room <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600  ">Made Simple</span>
          </h2>
          <p className="text-xl text-gray-600">
            We're redefining property search in Nepal by connecting people directly and securely.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
              <div className={`absolute inset-0 ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative p-8 h-full">
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 text-white shadow-md`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="relative h-64 lg:h-auto">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 to-blue-700/70" />
              <div className="relative h-full flex items-center justify-center p-8">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                    <FaHeart className="text-3xl text-white" />
                  </div>
                  <h4 className="text-2xl font-bold mb-1">Our Commitment</h4>
                  <p className="text-white/90">Dedicated to Nepal’s housing needs</p>
                </div>
              </div>
            </div>

            {/* Mission Text */}
            <div className="p-12 bg-white flex flex-col justify-center">
              <div className="inline-flex justify-center items-center bg-gradient-to-r from-blue-100 to-teal-100 rounded-full px-4 py-1 mb-4">
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-teal-500  bg-clip-text text-transparent">
                 Our Mission
                 </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Redefining Property Search in Nepal
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                RoomSathi is transforming how people find homes across Nepal. We're leveraging modern technology and deep local insights to deliver a seamless property experience.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Whether you're a student, a family, or a landlord, RoomSathi helps you find or list properties efficiently and securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
