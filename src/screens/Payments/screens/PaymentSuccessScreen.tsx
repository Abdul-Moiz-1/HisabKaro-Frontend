import React, { useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  Platform,
} from 'react-native';
import {
  CheckCircleIcon,
  ShareIcon,
  PrinterIcon,
  WhatsappLogoIcon,
  PlusCircleIcon,
  ClockCounterClockwiseIcon,
  SquaresFourIcon,
  XIcon,
  QuestionIcon,
} from 'phosphor-react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../../store/hooks';
import { Container, Button } from '../../../components/common';
import { PaymentReceipt } from '../components';
import { ROUTES } from '../../../constants/routes';
import { PaymentsFlowParamList } from '../PaymentsFlowNavigator';

type NavigationProp = StackNavigationProp<PaymentsFlowParamList>;
type RouteProps = RouteProp<PaymentsFlowParamList, typeof ROUTES.PAYMENT_SUCCESS>;

const PaymentSuccessScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const {
    paymentId,
    amount,
    partyName,
    partyType,
    method,
    receiptNumber,
    allocations = [],
    newBalance,
  } = route.params;

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Success icon animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Content fade in
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [scaleAnim, fadeAnim, slideAnim]);

  const handleShare = async () => {
    try {
      const message = `Payment Receipt\n\nAmount: Rs. ${amount.toLocaleString()}\nTo: ${partyName}\nReceipt #: ${receiptNumber}\nNew Balance: Rs. ${newBalance.toLocaleString()}\n\n- HisabKaro`;
      await Share.share({ message });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleRecordAnother = () => {
    // Go back to the selection screen
    if (partyType === 'customer') {
      navigation.navigate(ROUTES.SELECT_CUSTOMER, {});
    } else {
      navigation.navigate(ROUTES.SELECT_SUPPLIER, {});
    }
  };

  const handleViewHistory = () => {
    // Navigate to transaction history
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTES.SELECT_CUSTOMER }],
      })
    );
  };

  const handleGoToDashboard = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTES.SELECT_CUSTOMER }],
      })
    );
  };

  const handleClose = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROUTES.SELECT_CUSTOMER }],
      })
    );
  };

  const getMethodLabel = (m: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      bank: 'Bank Transfer',
      jazzcash: 'JazzCash',
      easypaisa: 'EasyPaisa',
    };
    return labels[m] || m;
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: theme.spacing.lg,
        },
        headerTitle: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        closeButton: {
          padding: theme.spacing.xs,
        },
        helpButton: {
          padding: theme.spacing.xs,
        },
        scrollContent: {
          padding: theme.spacing.lg,
          paddingTop: 0,
        },
        successSection: {
          alignItems: 'center',
          marginBottom: theme.spacing.xl,
        },
        successIconContainer: {
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: theme.colors.statusBackground?.success || '#E8F5E9',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.md,
        },
        sparkles: {
          position: 'absolute',
          top: -8,
          right: -8,
        },
        successTitle: {
          ...theme.typography.h2,
          color: theme.colors.text.primary,
          textAlign: 'center',
        },
        successSubtitle: {
          ...theme.typography.body,
          color: theme.colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginTop: theme.spacing.xs,
        },
        receiptContainer: {
          marginBottom: theme.spacing.xl,
        },
        actionButtonsRow: {
          flexDirection: 'row',
          justifyContent: 'center',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.xl,
        },
        actionButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primary,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borderRadius.full,
          gap: theme.spacing.sm,
        },
        actionButtonText: {
          ...theme.typography.body,
          fontWeight: '600',
          color: '#FFFFFF',
        },
        secondaryButtonsContainer: {
          gap: theme.spacing.sm,
        },
        secondaryButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.surface,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          gap: theme.spacing.sm,
        },
        secondaryButtonText: {
          ...theme.typography.body,
          fontWeight: '500',
          color: theme.colors.text.primary,
        },
        bottomRow: {
          flexDirection: 'row',
          justifyContent: 'center',
          gap: theme.spacing.md,
          marginTop: theme.spacing.md,
        },
        smallButton: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          gap: theme.spacing.xs,
        },
        smallButtonText: {
          ...theme.typography.bodySmall,
          color: theme.colors.text.secondary,
        },
      }),
    [theme]
  );

  return (
    <Container safeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <XIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Status</Text>
        <TouchableOpacity style={styles.helpButton}>
          <QuestionIcon size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon & Message */}
        <View style={styles.successSection}>
          <Animated.View
            style={[
              styles.successIconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <CheckCircleIcon size={48} color={theme.colors.success} weight="fill" />
          </Animated.View>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.successTitle}>
              {partyType === 'customer' ? 'Payment Received!' : 'Adaigi Ho Gai!'}
            </Text>
            <Text style={styles.successSubtitle}>
              {partyType === 'customer' 
                ? 'Payment Sent Successfully' 
                : 'Payment Sent Successfully'}
            </Text>
          </Animated.View>
        </View>

        {/* Payment Receipt */}
        <Animated.View
          style={[
            styles.receiptContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <PaymentReceipt
            amount={amount}
            dateTime={new Date().toISOString()}
            receiptNumber={receiptNumber}
            partyName={partyName}
            partyType={partyType}
            paymentMode={getMethodLabel(method)}
            allocations={allocations}
            newBalance={newBalance}
            showQR
          />
        </Animated.View>

        {/* Share Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <ShareIcon size={20} color="#FFFFFF" weight="fill" />
          <Text style={styles.actionButtonText}>Share Proof (WhatsApp)</Text>
        </TouchableOpacity>

        {/* Secondary Buttons */}
        <View style={styles.secondaryButtonsContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRecordAnother}
          >
            <PlusCircleIcon size={20} color={theme.colors.text.primary} />
            <Text style={styles.secondaryButtonText}>
              Agli Adaigi (Make Another)
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.smallButton} onPress={handleViewHistory}>
              <ClockCounterClockwiseIcon size={18} color={theme.colors.text.secondary} />
              <Text style={styles.smallButtonText}>View History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallButton} onPress={handleGoToDashboard}>
              <SquaresFourIcon size={18} color={theme.colors.text.secondary} />
              <Text style={styles.smallButtonText}>Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

export default PaymentSuccessScreen;
