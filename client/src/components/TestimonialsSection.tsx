import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      content: 'The report revealed critical information including a lien on the vehicle. This saved me a major headache and thousands of dollars.',
      author: 'David A.',
      location: 'Gilbert, AZ',
      rating: 5,
    },
    {
      id: 2,
      content: 'I was about to buy a used car that seemed perfect, but the CarReport showed it had been in a major accident. Thank you!',
      author: 'Sarah M.',
      location: 'Austin, TX',
      rating: 5,
    },
    {
      id: 3,
      content: 'The market comparison feature helped me negotiate a better price. I saved $1,500 on my purchase!',
      author: 'James K.',
      location: 'Miami, FL',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-linear-to-b from-primary-dark to-black">
      <div className="container-custom">
        {/* Testimonials Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
              What Our Users Say
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied customers who made better car buying decisions
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-neon-green/50 transition-all duration-300"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-neon-green/30 mb-4" />
              <p className="text-gray-300 italic mb-6">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-white">{testimonial.author}</p>
                <p className="text-gray-400 text-sm">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;