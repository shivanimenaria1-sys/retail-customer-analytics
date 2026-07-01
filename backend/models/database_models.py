from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Customer(Base):
    __tablename__ = 'customers'

    id = Column(Integer, primary_key=True)
    year_birth = Column(Integer, nullable=False)
    education = Column(String(50), nullable=False)
    marital_status = Column(String(50), nullable=False)
    income = Column(Numeric(12, 2))
    kidhome = Column(Integer, nullable=False, default=0)
    teenhome = Column(Integer, nullable=False, default=0)
    dt_customer = Column(Date, nullable=False)
    recency = Column(Integer, nullable=False)
    mnt_wines = Column(Integer, nullable=False, default=0)
    mnt_fruits = Column(Integer, nullable=False, default=0)
    mnt_meat_products = Column(Integer, nullable=False, default=0)
    mnt_fish_products = Column(Integer, nullable=False, default=0)
    mnt_sweet_products = Column(Integer, nullable=False, default=0)
    mnt_gold_prods = Column(Integer, nullable=False, default=0)
    num_deals_purchases = Column(Integer, nullable=False, default=0)
    num_web_purchases = Column(Integer, nullable=False, default=0)
    num_catalog_purchases = Column(Integer, nullable=False, default=0)
    num_store_purchases = Column(Integer, nullable=False, default=0)
    num_web_visits_month = Column(Integer, nullable=False, default=0)
    accepted_cmp3 = Column(Integer, nullable=False, default=0)
    accepted_cmp4 = Column(Integer, nullable=False, default=0)
    accepted_cmp5 = Column(Integer, nullable=False, default=0)
    accepted_cmp1 = Column(Integer, nullable=False, default=0)
    accepted_cmp2 = Column(Integer, nullable=False, default=0)
    complain = Column(Integer, nullable=False, default=0)
    response = Column(Integer, nullable=False, default=0)

    # Relationships (1-to-1)
    features = relationship("CustomerFeatures", back_populates="customer", uselist=False, cascade="all, delete-orphan")
    segment = relationship("CustomerSegments", back_populates="customer", uselist=False, cascade="all, delete-orphan")

class CustomerFeatures(Base):
    __tablename__ = 'customer_features'

    customer_id = Column(Integer, ForeignKey('customers.id', ondelete='CASCADE'), primary_key=True)
    age = Column(Integer, nullable=False)
    customer_tenure = Column(Integer, nullable=False)
    total_spending = Column(Numeric(12, 2), nullable=False)
    total_purchases = Column(Integer, nullable=False)
    average_spending_per_purchase = Column(Numeric(12, 2), nullable=False)

    customer = relationship("Customer", back_populates="features")

class CustomerSegments(Base):
    __tablename__ = 'customer_segments'

    customer_id = Column(Integer, ForeignKey('customers.id', ondelete='CASCADE'), primary_key=True)
    cluster = Column(Integer, nullable=False)
    pc1 = Column(Numeric(10, 6), nullable=False)
    pc2 = Column(Numeric(10, 6), nullable=False)

    customer = relationship("Customer", back_populates="segment")
