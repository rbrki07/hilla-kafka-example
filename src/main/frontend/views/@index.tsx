import { ActionOnLostSubscription } from '@vaadin/hilla-frontend';
import { useSignal } from '@vaadin/hilla-react-signals';
import {
  Button,
  Grid,
  GridColumn,
  HorizontalLayout,
  Icon,
  Notification,
  VerticalLayout,
} from '@vaadin/react-components';
import { ViewToolbar } from 'Frontend/components/ViewToolbar';
import Reservation from 'Frontend/generated/com/example/application/reservation/Reservation';
import { KafkaConsumerService } from 'Frontend/generated/endpoints';
import { useEffect } from 'react';

export default function ReservationsView() {
  const reservations = useSignal<Reservation[]>();
  const subscriptionNotificationOpened = useSignal<boolean>(false);
  const subscriptionNotificationMessage = useSignal<string | undefined>(undefined);

  useEffect(() => {
    const reservationSubscription = KafkaConsumerService.getLatestReservation()
      .onNext((reservation: Reservation) => {
        reservations.value = [...(reservations.value ?? []), reservation];
      })
      .onError((message: string) => {
        subscriptionNotificationOpened.value = true;
        subscriptionNotificationMessage.value = message;
      })
      .onSubscriptionLost(() => ActionOnLostSubscription.RESUBSCRIBE);
    return () => reservationSubscription.cancel();
  }, []);

  const closeSubscriptionNotification = () => {
    subscriptionNotificationOpened.value = false;
    subscriptionNotificationMessage.value = undefined;
  };

  const retrySubscription = () => {
    window.location.reload();
  };

  return (
    <VerticalLayout theme="margin">
      <ViewToolbar title="Reservations" />
      <Grid items={reservations.value}>
        <GridColumn path={'id'} />
        <GridColumn path={'date'} />
        <GridColumn path={'customer'} />
      </Grid>
      <Notification
        theme="warning"
        duration={0}
        position="middle"
        opened={subscriptionNotificationOpened.value}
        onOpenedChanged={(event) => {
          subscriptionNotificationOpened.value = event.detail.value;
        }}>
        <HorizontalLayout theme="spacing" style={{ alignItems: 'center' }}>
          <div>{subscriptionNotificationMessage.value ?? 'Failed to subscribe to reactive reservation endpoint'}</div>
          <Button theme="tertiary-inline" style={{ marginLeft: 'var(--lumo-space-xl)' }} onClick={retrySubscription}>
            Retry
          </Button>
          <Button theme="tertiary-inline icon" onClick={closeSubscriptionNotification} aria-label="Close">
            <Icon icon="lumo:cross" />
          </Button>
        </HorizontalLayout>
      </Notification>
    </VerticalLayout>
  );
}
