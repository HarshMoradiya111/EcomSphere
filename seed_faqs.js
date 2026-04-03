const mongoose = require('mongoose');
const FAQ = require('./models/FAQ');
require('dotenv').config();

const faqs = [
  {
    category: 'Orders',
    question: 'How can I track my order?',
    answer: 'Once your order is shipped, you will receive a tracking ID via email and SMS. You can also track your order from the "My Orders" section in your profile.',
    order: 1
  },
  {
    category: 'Orders',
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order within 24 hours of placement or until it has been processed for shipping. Go to My Profile > Orders to cancel.',
    order: 2
  },
  {
    category: 'Shipping',
    question: 'How long does delivery take?',
    answer: 'Standard delivery usually takes 3-5 business days. Remote locations may take up to 7-10 days. Express delivery options are available at checkout.',
    order: 1
  },
  {
    category: 'Shipping',
    question: 'What are the shipping charges?',
    answer: 'We offer FREE shipping on all orders above ₹999. For orders below this amount, a flat shipping fee of ₹99 is applicable.',
    order: 2
  },
  {
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major Credit/Debit cards, Net Banking, UPI (Google Pay, PhonePe, Paytm), and Cash on Delivery (COD) for most locations.',
    order: 1
  },
  {
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We offer a 7-day hassle-free return policy. Items must be unused, in original packaging, and with all tags intact to be eligible for a return.',
    order: 1
  },
  {
    category: 'Returns',
    question: 'How do I initiate a return?',
    answer: 'To start a return, go to My Profile > Orders, select the item you want to return, and click the "Request Return" button. Our courier partner will pick it up within 48 hours.',
    order: 2
  },
  {
    category: 'General',
    question: 'Is my personal data secure?',
    answer: 'Absolutely. We use industry-standard encryption (SSL) to protect your personal and payment information. We never share your data with third parties.',
    order: 1
  }
];

async function seedFAQs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomsphere');
    console.log('Connected to MongoDB...');
    
    // Clear existing FAQs first
    await FAQ.deleteMany({});
    console.log('Cleared existing FAQs.');

    await FAQ.insertMany(faqs);
    console.log('FAQs seeded successfully!');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding FAQs:', error);
    process.exit(1);
  }
}

seedFAQs();
