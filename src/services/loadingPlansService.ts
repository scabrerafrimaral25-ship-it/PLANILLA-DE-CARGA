import { supabase } from '../lib/supabase';
import { PalletData } from '../types';

export interface LoadingPlan {
  id: string;
  plan_name: string;
  master_data: PalletData[];
  search_ids: string[];
  created_at: string;
  updated_at: string;
}

export async function savePlan(
  planName: string,
  masterData: PalletData[],
  searchIds: string[] = []
): Promise<LoadingPlan | null> {
  try {
    const { data, error } = await supabase
      .from('loading_plans')
      .insert({
        plan_name: planName,
        master_data: masterData,
        search_ids: searchIds,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error saving plan:', error);
      return null;
    }

    return data as LoadingPlan;
  } catch (err) {
    console.error('Error saving plan:', err);
    return null;
  }
}

export async function updatePlan(
  planId: string,
  masterData: PalletData[],
  searchIds: string[] = []
): Promise<LoadingPlan | null> {
  try {
    const { data, error } = await supabase
      .from('loading_plans')
      .update({
        master_data: masterData,
        search_ids: searchIds,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating plan:', error);
      return null;
    }

    return data as LoadingPlan;
  } catch (err) {
    console.error('Error updating plan:', err);
    return null;
  }
}

export async function getAllPlans(): Promise<LoadingPlan[]> {
  try {
    const { data, error } = await supabase
      .from('loading_plans')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching plans:', error);
      return [];
    }

    return (data || []) as LoadingPlan[];
  } catch (err) {
    console.error('Error fetching plans:', err);
    return [];
  }
}

export async function getPlanById(planId: string): Promise<LoadingPlan | null> {
  try {
    const { data, error } = await supabase
      .from('loading_plans')
      .select('*')
      .eq('id', planId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching plan:', error);
      return null;
    }

    return data as LoadingPlan;
  } catch (err) {
    console.error('Error fetching plan:', err);
    return null;
  }
}

export async function deletePlan(planId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('loading_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting plan:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error deleting plan:', err);
    return false;
  }
}
